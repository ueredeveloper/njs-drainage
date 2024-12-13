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




