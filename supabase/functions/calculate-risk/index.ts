import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recent health metrics for the user (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: metrics, error: metricsError } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", user.id)
      .gte("recorded_at", sevenDaysAgo.toISOString())
      .order("recorded_at", { ascending: false });

    if (metricsError) {
      console.error("Metrics fetch error:", metricsError);
      return new Response(JSON.stringify({ error: "Failed to fetch metrics" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!metrics || metrics.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No recent health metrics found",
        assessments: [] 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate averages
    const avgMetrics = {
      heart_rate: calculateAverage(metrics, "heart_rate"),
      blood_pressure_systolic: calculateAverage(metrics, "blood_pressure_systolic"),
      blood_pressure_diastolic: calculateAverage(metrics, "blood_pressure_diastolic"),
      sleep_hours: calculateAverage(metrics, "sleep_hours"),
      sleep_quality: calculateAverage(metrics, "sleep_quality"),
      stress_level: calculateAverage(metrics, "stress_level"),
      steps: calculateAverage(metrics, "steps"),
      hydration: calculateAverage(metrics, "hydration"),
      energy_level: calculateAverage(metrics, "energy_level"),
    };

    console.log("Average metrics:", avgMetrics);

    // Use AI to analyze health risks
    const prompt = `Analyze these health metrics and provide risk assessments:
    
Average metrics over the last 7 days:
- Heart Rate: ${avgMetrics.heart_rate ?? "N/A"} bpm
- Blood Pressure: ${avgMetrics.blood_pressure_systolic ?? "N/A"}/${avgMetrics.blood_pressure_diastolic ?? "N/A"} mmHg
- Sleep Hours: ${avgMetrics.sleep_hours ?? "N/A"} hours
- Sleep Quality: ${avgMetrics.sleep_quality ?? "N/A"}/10
- Stress Level: ${avgMetrics.stress_level ?? "N/A"}/10
- Daily Steps: ${avgMetrics.steps ?? "N/A"}
- Hydration: ${avgMetrics.hydration ?? "N/A"}%
- Energy Level: ${avgMetrics.energy_level ?? "N/A"}/10

Based on these metrics, identify health risk areas. For each risk, provide:
1. Condition name (e.g., "Cardiovascular Health", "Sleep Quality", "Stress Management")
2. Risk level: "low", "moderate", or "high"
3. Risk score from 1-100
4. Brief description of the concern and recommendation`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a health analytics AI. Analyze health metrics and provide risk assessments. Be helpful but remind users to consult healthcare professionals for medical advice." 
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_risk_assessments",
              description: "Submit health risk assessments based on analyzed metrics",
              parameters: {
                type: "object",
                properties: {
                  assessments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        condition: { type: "string", description: "Name of the health condition or area" },
                        risk_level: { type: "string", enum: ["low", "moderate", "high"] },
                        risk_score: { type: "number", minimum: 1, maximum: 100 },
                        description: { type: "string", description: "Brief description and recommendation" }
                      },
                      required: ["condition", "risk_level", "risk_score", "description"]
                    }
                  }
                },
                required: ["assessments"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "submit_risk_assessments" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    // Extract assessments from tool call
    let assessments: any[] = [];
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      assessments = args.assessments || [];
    }

    // Store risk assessments in database
    const assessmentsToInsert = assessments.map((a: any) => ({
      user_id: user.id,
      condition: a.condition,
      risk_level: a.risk_level,
      risk_score: a.risk_score,
      description: a.description,
      assessed_at: new Date().toISOString(),
    }));

    if (assessmentsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("risk_assessments")
        .insert(assessmentsToInsert);

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to store assessments" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`Stored ${assessmentsToInsert.length} risk assessments for user ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true,
      assessments: assessmentsToInsert,
      message: `Analyzed ${metrics.length} metrics and created ${assessmentsToInsert.length} risk assessments`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateAverage(metrics: any[], field: string): number | null {
  const values = metrics.map(m => m[field]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
