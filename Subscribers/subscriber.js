const busses = require('./index');
/**
 * this will return the function
 * @param {*} busName 
 */
const filter_function_by_busname = (busName,msg) =>{
  const functionality = busses.filter(b=>{
    if(b.bus_name===busName){
      return b.functionality;
    }
  })
  if(functionality.length){
    functionality[0].functionality(JSON.parse(msg));
  }
}
 
module.exports = filter_function_by_busname;