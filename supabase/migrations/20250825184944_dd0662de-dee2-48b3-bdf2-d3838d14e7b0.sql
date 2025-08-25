-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contributors table
CREATE TABLE public.contributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  user_id UUID,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  paid_by_contributor_id UUID NOT NULL REFERENCES public.contributors(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for trips
CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for contributors
CREATE POLICY "Users can view contributors for their trips" 
ON public.contributors 
FOR SELECT 
USING (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()));

CREATE POLICY "Users can create contributors for their trips" 
ON public.contributors 
FOR INSERT 
WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()));

CREATE POLICY "Users can update contributors for their trips" 
ON public.contributors 
FOR UPDATE 
USING (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete contributors for their trips" 
ON public.contributors 
FOR DELETE 
USING (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()));

-- Create policies for expenses
CREATE POLICY "Users can view expenses for their trips" 
ON public.expenses 
FOR SELECT 
USING (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()));

CREATE POLICY "Users can create expenses for their trips" 
ON public.expenses 
FOR INSERT 
WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Users can update expenses for their trips" 
ON public.expenses 
FOR UPDATE 
USING (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete expenses for their trips" 
ON public.expenses 
FOR DELETE 
USING (trip_id IN (SELECT id FROM public.trips WHERE created_by = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();