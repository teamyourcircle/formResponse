//check in array

const compare = (field,labels) =>{
    for(let i=0;i<labels.length;i++){
      
        if(field===labels[i])
        {
        return true;
        }
    }
    return false;


}


module.exports =  check_for_required_labels  = (fields,labels) => {
    
    for(let i=0;i<fields.length;i++){
        if(compare(fields[i],labels)){
            return true;
        }
    }
    return false;

}
