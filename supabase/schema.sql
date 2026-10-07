-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('USER', 'GOVERNMENT');
CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE authenticity_verdict AS ENUM ('genuine', 'suspicious', 'fake', 'wrong_document', 'unreadable');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'USER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.services (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  description_en TEXT,
  description_hi TEXT,
  fields JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  service_id INTEGER NOT NULL REFERENCES public.services(id),
  status application_status DEFAULT 'PENDING',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES public.profiles(id),
  rejected_reason TEXT
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  extracted_text TEXT,
  ai_verdict authenticity_verdict DEFAULT 'unreadable',
  ai_reason JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id),
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  old_status application_status,
  new_status application_status,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_officer_read" ON public.profiles
  FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GOVERNMENT');

CREATE POLICY "applications_read_own_or_officer" ON public.applications
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GOVERNMENT');

CREATE POLICY "applications_insert_own" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_update_own_pending" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'PENDING');

CREATE POLICY "applications_update_officer" ON public.applications
  FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GOVERNMENT');

CREATE POLICY "documents_read_access" ON public.documents
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.applications WHERE id = application_id) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GOVERNMENT'
  );

CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.applications WHERE id = application_id));

CREATE POLICY "services_public_read" ON public.services
  FOR SELECT USING (true);

INSERT INTO public.services (name_en, name_hi, description_en, description_hi, fields) VALUES
('Driving License', 'ड्राइविंग लाइसेंस', 'Apply for a driving license.', 'ड्राइविंग लाइसेंस के लिए आवेदन करें।', '[
  {"name_en":"Full Name","name_hi":"पूरा नाम","type":"text","required":true},
  {"name_en":"Date of Birth","name_hi":"जन्मतिथि","type":"date","required":true},
  {"name_en":"Aadhaar Number","name_hi":"आधार संख्या","type":"text","required":true},
  {"name_en":"Address","name_hi":"पता","type":"textarea","required":true},
  {"name_en":"Mobile Number","name_hi":"मोबाइल नंबर","type":"tel","required":true}
]'),
('Passport', 'पासपोर्ट', 'Apply for a passport.', 'पासपोर्ट के लिए आवेदन करें।', '[
  {"name_en":"Full Name","name_hi":"पूरा नाम","type":"text","required":true},
  {"name_en":"Date of Birth","name_hi":"जन्मतिथि","type":"date","required":true},
  {"name_en":"Aadhaar Number","name_hi":"आधार संख्या","type":"text","required":true},
  {"name_en":"Father Name","name_hi":"पिता का नाम","type":"text","required":true},
  {"name_en":"Mother Name","name_hi":"माता का नाम","type":"text","required":true}
]'),
('Ration Card', 'राशन कार्ड', 'Apply for ration card support.', 'राशन कार्ड सहायता के लिए आवेदन करें।', '[
  {"name_en":"Full Name","name_hi":"पूरा नाम","type":"text","required":true},
  {"name_en":"Family Members","name_hi":"परिवार के सदस्य","type":"number","required":true},
  {"name_en":"Annual Income","name_hi":"वार्षिक आय","type":"number","required":true},
  {"name_en":"Address","name_hi":"पता","type":"textarea","required":true}
]');
