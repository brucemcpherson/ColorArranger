/**
 * becoming a little defunct
 * but here for backwards compat
 */
function getLibraryInfo () {

  return { 
    info: {
      name:'ColorArranger',
      version:'0.0.8',
      key:'MkxQ8A98nZ7NLSeDbsNDEZKi_d-phDA33',
      description:'addon for sorting sheet by colors',
      share:'https://script.google.com/d/1eSvQMHBpjkt13USxpH4CFOp9mxzyr5hv08M4E3Iz1Cw7gDxxoStH4eLU/edit?usp=sharing'
    },
    dependencies:[
     
    ]
  }; 
}


function showMyScriptAppResource(s) {
  try {
    return ScriptApp.getResource(s);
  }
  catch (err) {
    throw err + " getting script " + s;
  }
}

