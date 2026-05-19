create or replace function upsert_colaborador(
  p_id bigint,
  p_email character varying,
  p_password_hash text
)
returns table (
  id bigint,
  email character varying,
  autorizado boolean
)
language plpgsql
as $$
begin

  -- validação básica
  if p_email is null or trim(p_email) = '' then
    raise exception 'Email é obrigatório';
  end if;

  -- normaliza email
  p_email := lower(trim(p_email));

  -- 🔵 INSERT
  if p_id is null then

    if exists (
      select 1 from colaborador c where c.email = p_email
    ) then
      raise exception 'Email já cadastrado';
    end if;

    insert into colaborador (email, password_hash)
    values (p_email, p_password_hash)
    returning colaborador.id, colaborador.email, colaborador.autorizado
    into id, email, autorizado;

    return next;

  else

    -- 🔵 UPDATE
    if not exists (
      select 1 from colaborador c where c.id = p_id
    ) then
      raise exception 'Colaborador não encontrado';
    end if;

    if exists (
      select 1 from colaborador c
      where c.email = p_email
      and c.id <> p_id
    ) then
      raise exception 'Email já em uso';
    end if;

    update colaborador
    set
      email = p_email,
      password_hash = coalesce(p_password_hash, password_hash)
    where colaborador.id = p_id
    returning colaborador.id, colaborador.email, colaborador.autorizado
    into id, email, autorizado;

    return next;

  end if;

end;
$$;
