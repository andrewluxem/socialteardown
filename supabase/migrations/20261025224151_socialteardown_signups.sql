-- Signups from Social Teardown's Watchlist waitlist form. Written only by the
-- socialteardown-signup edge function with the service role; anon and
-- authenticated get no access, and RLS has no policies.
--
-- Kept apart from inboxteardown_signups on purpose, so the two sites' lists
-- never share a table; list = 'social-watchlist' marks each row as well.
-- email is text kept lowercase rather than citext, as there: citext is not
-- installed on this shared project, and this migration creates only
-- socialteardown objects. The check plus the unique constraint give a
-- case-insensitive dedupe.

create table public.socialteardown_signups (
  id bigint generated always as identity primary key,
  email text not null
    constraint socialteardown_signups_email_lower check (email = lower(email))
    constraint socialteardown_signups_email_length check (char_length(email) between 3 and 254),
  list text not null
    constraint socialteardown_signups_list_check check (list in ('social-watchlist')),
  -- Optional: the brand's Instagram handle or website, as typed.
  handle text
    constraint socialteardown_signups_handle_length check (char_length(handle) between 1 and 200),
  -- Optional: up to five brands the visitor wants watched.
  brands text[]
    constraint socialteardown_signups_brands_count check (cardinality(brands) between 1 and 5),
  source_page text,
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint socialteardown_signups_email_list_key unique (email, list)
);

alter table public.socialteardown_signups enable row level security;

revoke all on table public.socialteardown_signups from anon, authenticated;
revoke all on sequence public.socialteardown_signups_id_seq from anon, authenticated;
