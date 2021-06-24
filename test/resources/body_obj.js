//one section with two fields
exports.formResponse = {
    form_id: '118',
    section_list: [
        [{
            is_choice:true,
            gender: {
                male: 0,
                female: 1
            }
        },{
            is_choice:false,
            name: "nitesh"
        }]
    ]
}
exports.newformResponse = {
    form_id: '20',
    section_list: [
        [{
            is_choice:true,
            gender: {
                male: 0,
                female: 1
            }
        },{
            is_choice:false,
            name: "nitesh"
        }]
    ]
}
exports.activeOAuthRes = {
    "_id": "60bde569fadfff0a6a8203ad",
    "social_id": "109517401515895928040",
    "oauth_provider": "google",
    "access_token": "access - token",
    "user": "60b91f6dee3e746a0b550e96",
    "email": "kumarnitesh2000.nk@gmail.com",
    "integration_id": "google-sheets",
    "refresh_token": "refresh - token",
    "__v": 0,
    "additional_info": {
      "118": {
        "spreadsheet_id": "1yLaVLlZAJGG0dcQQ8BZMmoWt0NhjeMi28r9ereAVRQo",
        "sheetId": 977964886,
        "deleted": false
      },
      "key": "val"
    }
  }

exports.newformTemplate={
    template:{
        section: {
            section_title: ["test-section1"],
            section_description: ["here section 1"],
            section_fields: [2]
          },
        field: {
            field_label: ["gender","name"]
        }
    }
}

exports.formResponse_1 = {
    form_id: '420',
    section_list: [
        [{
            is_choice:true,
            gender: {
                male: 0,
                female: 1
            }
        },{
            is_choice:false,
            name: "nitesh"
        }]
    ]
}
exports.formArray = [
    {
        form_id: '118',
        section_list: [
            [{
                is_choice:true,
                gender: {
                    male: 0,
                    female: 1
                }
            },{
                is_choice:false,
                name: "nitesh"
            }]
        ]
    },
    {
        form_id: '20',
        section_list: [
            [{
                is_choice:true,
                gender: {
                    male: 0,
                    female: 1
                }
            },{
                is_choice:false,
                name: "nitesh"
            }]
        ]
    },
    {
        form_id: '111',
        section_list: [
            [{
                is_choice:true,
                gender: {
                    male: 0,
                    female: 1
                }
            },{
                is_choice:false,
                name: "nitesh"
            }]
        ]
    }
]
//user info by token
exports.userInfo = {
    email: 'kumarnitesh@mail.com',
    isverified: true, 
    id: '384738474747'
}

// add consumer
exports.consumerSchema = {
    formId: '118',
    queueName: 'hello'
}
exports.googleCalendarConsumer={
    "queueName": "google-calendar",
    "formId": "118",
    "template":{
    "title":"nitesh",
    "start_date_time": "13/03/2022",
    "end_date_time": "13/03/2022"
    }
  }
  exports.googleCalNotDateTime={
    "queueName": "google-calendar",
    "formId": "118",
    "template":{
    "title":"nitesh"
    }
  }
exports.consumerSchemaCalendar = {
    formId: '118',
    queueName: 'google-calendar'
}
exports.fakeConsumer = {
    formId: '118',
    queueName: 'fake'
}
exports.newconsumerSchema = {
    formId: '20',
    queueName: 'hello'
}
exports.myForms = {
    "form": [
      {
        "form_title": "test Form",
        "form_id": 118,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      },
      {
        "form_title": "test Form",
        "form_id": 20,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      },
      {
        "form_title": "test Form",
        "form_id": 420,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      },
      {
        "form_title": "test Form",
        "form_id": 111,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      }
    ]
}

exports.myFormsListFormService = {
    "forms": [
      {
        "form_title": "sheet Form",
        "form_id": 127,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      }
    ]
}

exports.newconsumerResponse = {
    "consumerList": [
        {
          "queueName": "hello"
        }
    ]
}
exports.consumerResponse_1 = {
    "consumerList": []
}
exports.consumerResponse = {
    "consumerList": [
        {
          "queueName": "hello"
        }
    ]
}
exports.consumerPayloadSheet = `{"formId":"118","responseBy":"60b91f6dee3e746a0b550e96","sections":[[{"is_choice":false,"name":"ritu"},
{"is_choice":true,"gender":{"male":0,"female":1}}]]}` 

exports.formTemplatedeleteRes = {'status':'done','id':20}

exports.formTemplate = {"template": {"form": {"form_title": "sheet Form", "form_description": "Description Section"}, "section": {"section_title": ["Section Title"], "section_description": [""], "section_fields": [2]}, "field": {"field_description": ["", ""], "field_label": ["name", "gender"], "field_type_list": [{"field_type": "text", "index": 0, "options": [], "required": false, "plugins": []}, {"field_type": "choice", "index": 1, "options": ["male", "female"], "required": false, "plugins": []}]}, "form_info": {"form_title": "sheet Form", "form_id": 420, "init": "12/03/2021 | 17:44 PM", "end": "14/04/2021 | 08:19 AM"}}};

exports.integrationList = {
    "integartionList": [
      {
        "_id": "",
        "social_id": "",
        "oauth_provider": "google",
        "access_token": "",
        "user": "",
        "email": "hardik@mail.com",
        "integration_id": "google-sheets",
        "refresh_token": "",
        "__v": 0,
        "additional_info": {
            "111": {
              "spreadsheet_id": "",
              "sheetId": 007
            }
          }
      }
    ]
  };

exports.integartionListWithoutAdditionInfo = {
    "integartionList": [
      {
        "_id": "",
        "social_id": "",
        "oauth_provider": "google",
        "access_token": "",
        "user": "",
        "email": "hardik@mail.com",
        "integration_id": "google-sheets",
        "refresh_token": "",
        "__v": 0,
      }
    ]
  };

exports.googleSheetResponse = {
    url: "",
    sheet_info: {
        spreadsheet_id:"",
        sheeId:"",
    },
    supportive_email: "hardik@gmail.com",
    status: 200,
};
exports.createSheetResponse = {
    url: "",
    sheet_info: {
        spreadsheet_id:"",
        sheeId:"",
    },
    supportive_email: "niteshdipg@mail.com",
    status: 200,
}
exports.formResponseArray = [
    {
    "_id": "606af26e0b77321ae8eac21a",
    "sections": [
        [
        {
            "is_choice": false,
            "name": "Hardik"
        },
        {
            "is_choice": false,
            "mob": "646546"
        },
        {
            "is_choice": true,
            "occupasion": {
            "student": true,
            "business": 0
            }
        },
        {
            "is_choice": true,
            "gender": {
            "male": 1,
            "female": 0
            }
        }
        ]
    ],
    "formId": 111,
    "responseBy": "hardikshah.hs2015@gmail.com",
    "__v": 0
    },
    {
    "_id": "606af29b0b77321ae8eac21b",
    "sections": [
        [
        {
            "is_choice": false,
            "name": "Nitesh "
        },
        {
            "is_choice": false,
            "mob": "4651531"
        },
        {
            "is_choice": true,
            "occupasion": {
            "student": true,
            "business": true
            }
        },
        {
            "is_choice": true,
            "gender": {
            "male": 1,
            "female": 0
            }
        }
        ]
    ],
    "formId": 111,
    "responseBy": "hardikshah.hs2015@gmail.com",
    "__v": 0
    }
]

exports.sheetFunctionalityResource = {
    my_formData:{
    "name":["now","sss","nitesh kumar and now","empire","now","lol","lol","djdjjdjd","niteshkumartestsuhail","anmol","gfg","gfg","ddd"],
    "gender":[{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0},{"male":0,"female":1},{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0},{"male":1,"female":0}]
    },
    COLUMNS: ["name","gender"],
    sheetId: "3434219"
}
  
exports.createSheetBody = {
    oauth_provider:'google',
    integration_id: 'google-sheets',
    formId: 111,
    supportive_email:'hardik@mail.com',
}

exports.credentialsBody = {
    "google_client_id": "dummy client id",
    "google_client_secret": "dummy clinet secret",
    "google_redirect_uri": "http://localhost:3000"
}

exports.dropboxIntegrationList = {
    "integartionList": [
        {
          "_id": "",
          "social_id": "",
          "oauth_provider": "drop_box",
          "access_token": "dropbox access token",
          "user": "",
          "email": "hardik@mail.com",
          "integration_id": "drop_box",
          "refresh_token": "dropbox refresh token",
          "__v": 0,
        }
    ]
}
exports.folderIdResponse = {'folder_id':'0123456789'}