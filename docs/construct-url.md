

Utilizando `url.searchParams`. Ver [url.searchParams](https://nodejs.org/api/url.html#new-urlinput-base). O objeto `json.token` é obtido na primeira requisição `POST`.

 ```
 const url = new URL('https://gis.adasa.df.gov.br')
          url.pathname = '/server/rest/services/Formul%C3%A1rios_Outorgas/MapServer/4/query'
          url.searchParams.append('where','OBJECTID>6000');
          url.searchParams.append('geometryType','esriGeometryEnvelope');
          url.searchParams.append('spatialRel','esriSpatialRelIntersects');
          url.searchParams.append('outFields','*');
          url.searchParams.append('returnGeometry','true');
          url.searchParams.append('returnTrueCurves','false');
          url.searchParams.append('returnIdsOnly','false');
          url.searchParams.append('returnCountOnly','false');
          url.searchParams.append('returnZ','false');
          url.searchParams.append('returnM','false');
          url.searchParams.append('returnDistinctValues','false');
          url.searchParams.append('returnExtentsOnly','false');
          url.searchParams.append('f','pjson');
          url.searchParams.append('token',json.token);
         console.log(url.href)
```
Criando meu algorítimo:

 ```
let  href = "https://gis.adasa.df.gov.br";
let  pathname  = "/server/rest/services/Formul%C3%A1rios_Outorgas/MapServer/4/query"

  const params = {
                    where: w,
                    geometryType:'esriGeometryEnvelope',
                    spatialRel:'esriSpatialRelIntersects',
                    outFields:'*',
                    returnGeometry:'true',
                    returnTrueCurves:'false',
                    returnIdsOnly:'false',
                    returnCountOnly:'false',
                    returnZ:'false',
                    returnM:'false',
                    returnDistinctValues:'false',
                    returnExtentsOnly:'false',
                    f:'pjson',
                    token:json.token
            }
            // Converter o objeto para array
            //   Ex: ['?where=OBJECTID>+100999','&geometryType=esriGeometryEnvelope',...]
            
            var paramsArray = Object.entries(params).map(x=>  {
            	if (x[0]==='where'){
                return '?'+ x[0] + '=' + x[1]
                } else { 
                return '&'+ x[0] + '=' + x[1]
                }
            
            } );
            //  Converter a array para string
            //  Ex: '?where=OBJECTID>+100999&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects...'
       
            const paramsString = paramsArray.reduce(
              (previousValue, currentValue) => previousValue + currentValue,''
            );

        //console.log(href + pathname + paramsString)

```
