-- Seed exécuté après les migrations lors de `supabase db reset`.

-- Ligne profil unique (id = 1) utilisée par le site public.
insert into public.profile (id)
values (1)
on conflict (id) do nothing;
