

var selected_year = 6;
var selected_scenario = 0;

///////////////////////////////////////////////////////////////////////////////////////////////////

var data = {
  definition: 'MMM_FINAL_0.1.gh',
  inputs: getInputs()
}


let rhino, doc;

//////////////////////////////////////////////////////////////////////////////////////////////////
// more globals


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Gets <input> elements from html and sets handlers
 * (html is generated from the grasshopper definition)
 */
function getInputs() {
  var inputs = {}
  inputs['Plot Price per meter square'] = parseInt($('#i_plot').val());
  localStorage.setItem('plot',parseInt($('#i_plot').val()));

  inputs['BedRoom-Couple'] = parseInt($('#i_cpl').val());
  localStorage.setItem('cpl',parseInt($('#i_cpl').val()));
  inputs['Bedroom-Children-M'] = parseInt($('#i_bcm').val());
  localStorage.setItem('bcm',parseInt($('#i_bcm').val()));
  inputs['Bedroom-Children-F'] = parseInt($('#i_bcf').val());
  localStorage.setItem('bcf',parseInt($('#i_bcf').val()));
  inputs['BathRoom'] = parseInt($('#i_bath').val());
  localStorage.setItem('bath',parseInt($('#i_bath').val()));
  inputs['Kitchen'] = parseInt($('#i_kit').val());
  localStorage.setItem('kit',parseInt($('#i_kit').val()));
  inputs['LivingRoom'] = parseInt($('#i_liv').val());
  localStorage.setItem('liv',parseInt($('#i_liv').val()));


  return inputs
}

 /////////////////////////////////////////////////////////////////////////////////////////////////////
 // camera path// 
 ///////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
async function compute() {
  // construct url for GET /solve/definition.gh?name=value(&...)
  const url = new URL('/solve/' + data.definition, window.location.origin)
  Object.keys(data.inputs).forEach(key => url.searchParams.append(key, data.inputs[key]))
  console.log(url.toString())
  
  try {
    const response = await fetch(url)
  
    if(!response.ok) {
      // TODO: check for errors in response json
      throw new Error(response.statusText)
    }

    const responseJson = await response.json()

    collectResults(responseJson)

  } catch(error) {
    console.error(error)
  }
}

console.log(data.inputs)
/**
* Parse response
*/
//**MESH MATCHING TO COLOR**//



function collectResults(responseJson) {
  const values = responseJson.values;

  console.log(values);
 




// for each output (RH_OUT:*)...
for ( let i = 0; i < values.length; i ++ ) {

// ...iterate through data tree structure...
for (const path in values[i].InnerTree) {
  const branch = values[i].InnerTree[path]

  // ...and for each branch...
  for( let j = 0; j < branch.length; j ++) {
    // ...load rhino geometry into doc

      
         //GET VALUES
        if (values[i].ParamName == "RH_OUT:plot_area") {
          //area = JSON.parse(responseJson.values[i].InnerTree['{ 0; }'][0].data)
          $('#plot').html(parseFloat(JSON.parse(branch[j].data)).toFixed(2)+" m²");

        }

    }
  }
}


}

$('#validate').click(function(){
  data.inputs = getInputs();
  compute();

});

$('#next').click(function(){
  var url_next = new URL('/examples/MMM_FINAL/', window.location.origin)
  window.location = url_next.toString();
});