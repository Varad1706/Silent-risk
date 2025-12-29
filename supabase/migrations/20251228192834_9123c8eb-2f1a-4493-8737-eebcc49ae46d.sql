-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create health_metrics table
CREATE TABLE public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  temperature DECIMAL(4,1),
  stress_level INTEGER,
  hydration INTEGER,
  energy_level INTEGER,
  steps INTEGER,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on health_metrics
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- Health metrics policies
CREATE POLICY "Users can view their own health metrics" 
ON public.health_metrics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics" 
ON public.health_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics" 
ON public.health_metrics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health metrics" 
ON public.health_metrics FOR DELETE 
USING (auth.uid() = user_id);

-- Create risk_assessments table
CREATE TABLE public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  condition TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  description TEXT,
  assessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on risk_assessments
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- Risk assessments policies
CREATE POLICY "Users can view their own risk assessments" 
ON public.risk_assessments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk assessments" 
ON public.risk_assessments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Alerts policies
CREATE POLICY "Users can view their own alerts" 
ON public.alerts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" 
ON public.alerts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.alerts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" 
ON public.alerts FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for health_metrics and alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;