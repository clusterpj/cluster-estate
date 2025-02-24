-- Create the function to get bookings with details
create or replace function get_bookings_with_details(
  p_limit int,
  p_offset int,
  p_status text default null,
  p_search text default null
) returns setof json as $$
begin
  return query
  select json_build_object(
    'id', b.id,
    'created_at', b.created_at,
    'updated_at', b.updated_at,
    'user_id', b.user_id,
    'property_id', b.property_id,
    'check_in', b.check_in,
    'check_out', b.check_out,
    'status', b.status,
    'payment_status', b.payment_status,
    'total_price', b.total_price,
    'property', json_build_object(
      'title', p.title,
      'location', p.location,
      'images', p.images
    ),
    'guest_details', json_build_object(
      'email', u.email,
      'raw_user_meta_data', u.raw_user_meta_data
    ),
    'payment_details', b.payment_details
  )
  from bookings b
  left join properties p on b.property_id = p.id
  left join auth.users u on b.user_id = u.id
  where
    (p_status is null or b.status = p_status)
    and (
      p_search is null
      or p.title ilike '%' || p_search || '%'
      or u.email ilike '%' || p_search || '%'
      or (u.raw_user_meta_data->>'full_name') ilike '%' || p_search || '%'
    )
  order by b.created_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;
