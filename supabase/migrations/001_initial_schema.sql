-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'moderator', 'user')),
  full_name text,
  username text UNIQUE,
  avatar_url text,
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  join_code text UNIQUE NOT NULL,
  banner_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  upload_count int NOT NULL DEFAULT 0,
  approved_count int NOT NULL DEFAULT 0,
  max_uploads_per_user int NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Room moderators table
CREATE TABLE IF NOT EXISTS room_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  moderator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, moderator_id)
);

-- Room members table
CREATE TABLE IF NOT EXISTS room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  thumbnail_url text,
  file_name text,
  file_size int,
  width int,
  height int,
  mime_type text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  rejection_reason text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_join_code ON rooms(join_code);
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_moderators_room_id ON room_moderators(room_id);
CREATE INDEX IF NOT EXISTS idx_room_moderators_moderator_id ON room_moderators(moderator_id);
CREATE INDEX IF NOT EXISTS idx_photos_room_id ON photos(room_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploader_id ON photos(uploader_id);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_room_status ON photos(room_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- RLS Policies: rooms
CREATE POLICY "Rooms viewable by members and managers" ON rooms
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM room_members rm WHERE rm.room_id = id AND rm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM room_moderators rmo WHERE rmo.room_id = id AND rmo.moderator_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "Rooms viewable by anyone with join code (public info)" ON rooms
  FOR SELECT TO anon
  USING (status = 'active');

CREATE POLICY "Managers and admins can create rooms" ON rooms
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "Owners and admins can update rooms" ON rooms
  FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can delete rooms" ON rooms
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies: room_members
CREATE POLICY "Room members visible to room members and managers" ON room_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM room_moderators rmo WHERE rmo.room_id = room_id AND rmo.moderator_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "Authenticated users can join rooms" ON room_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can leave or owners/admins can remove" ON room_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies: room_moderators
CREATE POLICY "Room moderators visible to room owners, mods, admins" ON room_moderators
  FOR SELECT TO authenticated
  USING (
    moderator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

CREATE POLICY "Owners and admins can assign moderators" ON room_moderators
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Owners and admins can remove moderators" ON room_moderators
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- RLS Policies: photos
CREATE POLICY "Approved photos visible to public" ON photos
  FOR SELECT TO anon
  USING (status = 'approved');

CREATE POLICY "Photos visible to room members and moderators" ON photos
  FOR SELECT TO authenticated
  USING (
    uploader_id = auth.uid()
    OR EXISTS (SELECT 1 FROM room_members rm WHERE rm.room_id = room_id AND rm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM room_moderators rmo WHERE rmo.room_id = room_id AND rmo.moderator_id = auth.uid())
    OR EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Members can upload photos" ON photos
  FOR INSERT TO authenticated
  WITH CHECK (
    uploader_id = auth.uid()
    AND EXISTS (SELECT 1 FROM room_members rm WHERE rm.room_id = room_id AND rm.user_id = auth.uid())
  );

CREATE POLICY "Uploaders can delete their own pending/rejected photos" ON photos
  FOR DELETE TO authenticated
  USING (
    (uploader_id = auth.uid() AND status IN ('pending', 'rejected'))
    OR EXISTS (SELECT 1 FROM room_moderators rmo WHERE rmo.room_id = room_id AND rmo.moderator_id = auth.uid())
    OR EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Moderators can update photo status" ON photos
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM room_moderators rmo WHERE rmo.room_id = room_id AND rmo.moderator_id = auth.uid())
    OR EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

-- RLS Policies: audit_logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Managers can view audit logs for their rooms" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    actor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
