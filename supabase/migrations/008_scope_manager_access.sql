-- Fixes two findings from the deeper security assessment:
--
-- 1. audit_logs RLS granted any manager unconditional platform-wide SELECT despite the
--    policy's own name claiming "for their rooms" — live-confirmed exploitable.
-- 2. photos UPDATE policy's manager branch was not scoped to rooms the manager actually
--    owns/moderates, reintroducing the exact bug class already fixed once for moderatePhoto.
--    (Live testing showed this specific path was not actually exploitable today for reasons
--    that don't matter — the committed policy text must match the intended least-privilege
--    model regardless, since disaster-recovery/rebuild from these migrations must not
--    reintroduce a real hole.)

DROP POLICY IF EXISTS "Managers can view audit logs for their rooms" ON audit_logs;
CREATE POLICY "Managers can view audit logs for their rooms" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    actor_id = auth.uid()
    OR public.fn_user_role(auth.uid()) = 'admin'
    OR (
      public.fn_user_role(auth.uid()) = 'manager'
      AND target_type = 'room'
      AND public.fn_owns_room(target_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Moderators can update photo status" ON photos;
CREATE POLICY "Moderators can update photo status" ON photos
  FOR UPDATE TO authenticated
  USING (
    public.fn_is_room_moderator(room_id, auth.uid())
    OR public.fn_owns_room(room_id, auth.uid())
    OR public.fn_user_role(auth.uid()) = 'admin'
  );
