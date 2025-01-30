alter table "auth"."users" alter column "role" set default 'customer'::text;

alter table "auth"."users" alter column "role" set data type text using "role"::text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.user_is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT (role = 'admin')::boolean
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$function$
;

grant select on table "auth"."users" to "authenticated";

create policy "Users can read own role"
on "auth"."users"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "auth_users_policy"
on "auth"."users"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


create policy "Property images are publicly accessible"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'property-images'::text));


create policy "Users can delete their own property images"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'property-images'::text) AND (auth.uid() = owner)));


create policy "Users can update their own property images"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'property-images'::text) AND (auth.uid() = owner)));


create policy "Users can upload property images"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'property-images'::text) AND (auth.role() = 'authenticated'::text)));



