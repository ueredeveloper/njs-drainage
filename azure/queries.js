/**
* Buscar um usuário a partir de busca de nome, cpf, documento sei ou processo sei
* @param {string} us_nome Nome do usuário. 
* @param {string} us_cpf_cnpj CPF ou CNPJ do usuário.
* @param {string} doc_sei Documento no sistema SEI.
* @param {string} proc_sei Processo no sistema SEI.
* @return {Array} Retorna uma array com usuários selecionados, endereço, documento relacionado e processo.
*/



exports.getUsers = function(us_nome, us_cpf_cnpj, doc_sei, proc_sei) {
  //console.log(us_nome, us_cpf_cnpj, doc_sei, proc_sei)
  return `
  USE [DB_SRH]
  SELECT 
  _us.us_ID us_id, 
  _us.us_Nome us_nome,
  _us.us_CPF_CNPJ us_cpf_cnpj, 
  _us.us_Documento_FK us_doc_id,

  _doc.doc_Endereco_FK doc_end, 
  _doc.doc_SEI doc_sei,
  _doc.doc_Processo proc_sei,
  _end.end_ID end_id, 
  _end.end_Logradouro end_logradouro

  FROM [dbo].[Usuario] _us 
  /*left join [dbo].[Documento] _doc on _doc.doc_ID = _us.us_Documento_FK
  left join [dbo].[Endereco] _end on _end.end_Usuario_FK = _us.us_ID */
  left join [dbo].[Endereco] _end on _end.end_Usuario_FK = _us.us_ID 
  left join [dbo].[Documento] _doc on _doc.doc_Endereco_FK = _end.end_ID
  where 
    _us.us_Nome like '%${us_nome}%' or 
    _us.us_CPF_CNPJ like '%${us_cpf_cnpj}%' or 
    _doc.doc_SEI like '%${doc_sei}%' or 
    _doc.doc_Processo like '%${proc_sei}%'
`
}
/**
* Buscar finalidades autorizadas relacionados com um endereço (end_id)
* @param {integer} end_id Id do endereço buscado 
* @return {Array} Retorna uma array com finalidades autorizadas para o endereço selecionado.
*/
exports.getDemands = function(end_id) {
  return `
  USE [DB_SRH]

select 
  _in.inter_ID int_id,
  _en.end_ID end_id,
  _en.end_Logradouro end_logradouro,
  _in.[inter_DD_Latitude] int_latitude,
  _in.[inter_DD_Longitude] int_longitude,
  _sub.[sub_Tipo_Poco_FK] sub_tp_id,
  dt_demanda = (select 

      (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Jan as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Jan  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Jan as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jan as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Jan as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jan *_fa.fa_Tempo_Cap_Jan as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
      (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Fev as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Fev  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Fev as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Fev as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Fev as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Fev *_fa.fa_Tempo_Cap_Fev as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
      (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Mar as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Mar  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Mar as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Mar as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Mar as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Mar *_fa.fa_Tempo_Cap_Mar as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
      (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Abr as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Abr  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Abr as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Abr as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Abr as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Abr *_fa.fa_Tempo_Cap_Abr as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
      (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Mai as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Mai  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Mai as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Mai as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Mai as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Mai *_fa.fa_Tempo_Cap_Mai as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),(
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Jun as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Jun  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Jun as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jun as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Jun as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jun *_fa.fa_Tempo_Cap_Jun as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      )
  ,
  (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Jul as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Jul  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Jul as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jul as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Jul as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jul *_fa.fa_Tempo_Cap_Jul as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
  (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Ago as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Ago  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Ago as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Ago as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Ago as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Ago *_fa.fa_Tempo_Cap_Ago as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
  (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Set as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Set  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Set as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Set as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Set as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Set *_fa.fa_Tempo_Cap_Set as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
  (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Out as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Out  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Out as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Out as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Out as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Out *_fa.fa_Tempo_Cap_Out as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
  (
  select 
    CAST(_sub.sub_Vazao_Outorgada as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Nov as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Nov  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Nov as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Nov as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Nov as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Nov *_fa.fa_Tempo_Cap_Nov as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
  (
  select 
    CAST(_sub.sub_Vazao_Outorgada  as decimal(10,0)) vazao_lh,
    CAST(_fa.fa_Q_Dia_Dez as decimal(10,0)) vazao_ld,
    CAST(_fa.fa_Tempo_Cap_Dez  as decimal(10,0)) mes,
    CAST(_sub.sub_Vazao_Outorgada/1000 as decimal(10,2)) vazao_mh,
    CAST(_fa.fa_Q_Hora_Dez as decimal(10,0)) tempo_h,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Dez as decimal(10,2)) vol_max_md,
    CAST(_fa.fa_Tempo_Cap_Dez as decimal(10,0)) periodo_d,
    CAST((_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Dez *_fa.fa_Tempo_Cap_Dez as decimal(10,2)) vol_mensal_mm


    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH('demandas'), TYPE
      ),
  (select 
    CAST(
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jan	*_fa.fa_Tempo_Cap_Jan	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Fev	*_fa.fa_Tempo_Cap_Fev	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Mar	*_fa.fa_Tempo_Cap_Mar	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Abr	*_fa.fa_Tempo_Cap_Abr	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Mai	*_fa.fa_Tempo_Cap_Mai	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jun	*_fa.fa_Tempo_Cap_Jun	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Jul	*_fa.fa_Tempo_Cap_Jul	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Ago	*_fa.fa_Tempo_Cap_Ago	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Set	*_fa.fa_Tempo_Cap_Set	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Out	*_fa.fa_Tempo_Cap_Out	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Nov	*_fa.fa_Tempo_Cap_Nov	  +
    (_sub.sub_Vazao_Outorgada/1000)*_fa.fa_Q_Hora_Dez	*_fa.fa_Tempo_Cap_Dez	  as decimal(10,0)) vol_anual_ma

    from [dbo].[Finalidade_Autorizada] _fa
      WHERE _fin.fin_ID = _fa.fa_Finalidade_FK
      FOR XML PATH(''), TYPE
      )
      FOR XML PATH('demandas')
  )
  from [dbo].[Finalidade_Autorizada] _fa
  left join [dbo].[Finalidade] _fin on _fin.fin_ID = _fa.fa_Finalidade_FK
  left join [dbo].[Interferencia] _in on _in.inter_ID = _fin.fin_Interferencia_FK
  left join [dbo].[Endereco] _en on _en.end_ID = _in.inter_Endereco_FK
  left join [dbo].[Subterranea] _sub on _sub.sub_Interferencia_FK = _in.inter_ID

  where _en.end_ID = ${end_id}
 `
}