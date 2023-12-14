Connection with ArgGis Server
=============================

 ```
 (async () => {

    // autorization
    const client_auth_id = process.env.client_auth_id
    const client_auth_secret = process.env.client_auth_secret
    // get token
    const params = new URLSearchParams();
  
    params.append('f', 'json')
    params.append('username', process.env.client_auth_id);
    params.append('password', process.env.client_auth_secret);
    params.append('referer', 'https://replit.com/')
    //console.log(params)
    // post method - get token
    const data = await fetch(
      'https://gis.adasa.df.gov.br/portal/sharing/rest/generateToken',
      {
        method: 'POST',
        body: params
      }
    )
      .catch(console.log)
      .then(d => d.json())
      .then(json => {
          let where = ['OBJECTID>%3D0+AND+OBJECTID<%3D3999'
            ,'OBJECTID>%3D4000+AND+OBJECTID<%3D100999'
            ,'OBJECTID>+100999']

        for (const w of where) {

          //  OBJECTID>%3D0+AND+OBJECTID<%3D3999
            //  OBJECTID>%3D4000+AND+OBJECTID<%3D100999
            //  OBJECTID>+100999

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

        //get method - get users
        fetch(href + pathname + paramsString, {
          
          method: 'GET'
        })
          .then(res => res.json())
          .then(json => json.features.map(f=> {db.set(f.attributes.OBJECTID, f.attributes)}))

        } // fim loop for where
 
      }) // fim then => json
  
  })();
*/

/*
db.getAll().then(keys=> {
  console.log(keys)
}) */
/*
db.getAll().then(keys=> {
  fs.writeFile('superficial.json', JSON.stringify(Object.values(keys)), (err) => {  
    if (err) throw err; 
}) 
})
```