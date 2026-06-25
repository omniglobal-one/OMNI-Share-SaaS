-- H1: Restrict profiles SELECT — was USING (true), letting any authed user read all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

-- Users can always read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Admins and managers can read all profiles (needed for dashboards)
CREATE POLICY "Admins and managers can read all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager'))
  );

-- Moderators can read profiles of members in rooms they moderate (needed for moderation queue)
CREATE POLICY "Moderators can read profiles in their rooms" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_moderators rmo
      JOIN room_members rm ON rmo.room_id = rm.room_id
      WHERE rmo.moderator_id = auth.uid()
        AND rm.user_id = id
    )
  );

-- H2: Remove anon policy that allowed enumeration of all active rooms
-- The join flow goes through the service-role API route and does not need direct anon DB access
DROP POLICY IF EXISTS "Rooms viewable by anyone with join code (public info)" ON rooms;
