# To-Do List

## 14/12/2023
- **Tarefa [X]** - Rios DF
  - Adicionar os rios de DF.
  - Adicionado em 20/02/2024.

## 13/12/2024
- **Mudar projeto para o banco de dados Postgres Azure.**

---

## Funções utilizadas no React JS - Drainage All

### `findAllPointsInCircle`
- Função para buscar pontos dentro de um círculo, dado um centro e um raio.

**Objeto JSON enviado:**
```json
{
  "center": {
    "lng": -47.755860843370726,
    "lat": -15.743509964163012
  },
  "radius": 2632
}
```

### `findAllPointsInRectangle`
- Função para buscar pontos dentro de um retângulo, dado os limites das coordenadas (xmin, ymin, xmax, ymax).

**Exemplo de retângulo:**
```
xmin, ymin, xmax, ymax
-47.7544875523551, -15.828085825327648, -47.728395023058226, -15.805623805877323

```
**Exemplo de body enviado:**

```body: 

JSON.stringify({
  xmin,
  ymin,
  xmax,
  ymax
})

```
## 06/02/2025 
- [X] Criação da tabela `otto-bacias` e método de busca dos polígonos por uma coordenada.
- [X] Criar arquivo .md de conexão via FTP.

### Observação
  No último commit, no momento em que enviei para o github o azure atualizou junto, porém estava faltando as senhas do banco da Adasa. Estas senhas não devem ser enviadas junto com os arquivos para o azure, ou seja, o arquivo .env não deve ser enviado. As senhas devem ser adicionadas nas variáveis ambiente do portal azure.


## 13/06/2025
- [X] Foi verificado que a área da uh 26 está nula. 
    Foi calculado a área temporariamente em 117.41 km² e editado
      update unidades_hidrograficas set area_km_sq = 117.41 where objectid = 42

  
## 23/07/2025

- [X] Não consegui achar a barragem pelo processo (00197-00001926/2023-58). Modifiquei a regra de cors para aceitar apenas requisções do link do front end.

## 10/11/2025
- [] Selecionar interferência
    Ao selecionar interferência se faz uma busca dos detalhes. Porém estes destalhes no novo serviço já estão vindo, sem precisar de pesquisar novamente.

