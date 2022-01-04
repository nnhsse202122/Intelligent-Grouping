// Imports \\
const app = require('express')()
const http = require('http').createServer(app)
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const {OAuth2Client} = require('google-auth-library')
const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID)
const fs = require("fs")
const md5 = require("./md5.js")

// Constants \\
const DBName = "data"

// Database \\
mongoose.connect(`mongodb+srv://GroupingApp:${process.env.DBPASS}@groupingapp.iz1de.mongodb.net/${DBName}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

db.on('error', console.error.bind(console, 'Connection Error:'))
db.once('open', function() {
  console.log("Connected to Database")
})

//Schema
const userSchema = new mongoose.Schema({
  id: String,
  classes: [
    {
      id: String,
      name: String,
      period: String,
      preferences: [],
      students: [
        {
          id: String,
          first: String,
          last: String,
          middle: String,
          email: String,
          preferences: {
            studentLike: [],
            studentDislike: [],
            topicLike: [],
            topicDislike: [],
          }
        }
      ],
      groupings: [
        {
          id: String,
          name: String,
          excluded: [],
          groups: [[String]]
        }
      ]
    }
  ]
})



const User = mongoose.model("User", userSchema)

// Express \\
const sendFileOptions = {
    root: __dirname + '/static',
    dotfiles: 'deny'
}

app.use(bodyParser.json())

//Routing
app.get('/', async (req, res) => {
  res.sendFile('/index.html', sendFileOptions)
})

app.get("/form/:userId/:classId", async (req, res) => {
  const user = await User.findOne({id: req.params.userId}).exec()
  if (user) {
    const classObj = user.classes.find(c => c.id == req.params.classId)
    if (classObj) {
      res.sendFile('/form/index.html', sendFileOptions)
    } else {
      res.sendFile('/404/index.html', sendFileOptions)
    }
  } else {
    res.sendFile('/404/index.html', sendFileOptions)
  }
})

//Endpoints
app.get("/login", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  const user = await User.findOne({id: verification.user.sub}).exec()
  if (verification.status && !user) {
    new User({id: verification.user.sub}).save((e) => {
      if (e) return console.log(e)
    })
    res.json({...verification, classes: []})
  } else {
    // console.log(user.classes[0].preferences)
    // console.log(user.classes[0].students[0].preferences.studentLike[0].inputs)
    // console.log(user.classes[0].students[0].preferences.topicLike[0].inputs)
    res.json({...verification, classes: user.classes})
  }
})

app.get("/formData", async (req, res) => {
  const user = await User.findOne({id: req.query.user}).exec()
  if (user) {
    const classObj = user.classes.find(c => c.id == req.query.class)
    if (classObj) {
      res.json({status: true, preferences: classObj.preferences, className: classObj.name, period: classObj.period, students: classObj.students.map(s => (
        {name: `${s.first} ${s.middle ? `${s.middle}. ` : ""}${s.last}`, id: md5(s.id)}
      ))})
    } else {
      res.json({status: false, error: "No Form Found"})
    }
  } else {
    res.json({status: false, error: "No Form Found"})
  }
})

app.post("/saveStudentPreferences", async (req, res) => {
  const user = await User.findOne({id: req.body.userId, classes: {$elemMatch: {id: req.body.id}}}).exec()
  if (user) {
    const classObj = user.classes.find(c => c.id == req.body.id)
    const student = classObj.students.find(s => s.id == req.body.studentId)
    if (student) {
      for (const preference of req.body.preferences) {
        if (["studentLike", "studentDislike"].includes(preference.type)) {
          preference.inputs = preference.inputs.map(id => classObj.students.find(s => id == md5(s.id)).id)
        }
        student.preferences[preference.type] = preference
      }
      await user.save()
      res.json({status: true})
    } else {
      res.json({status: false, error: "No Student Found"})
    }
  } else {
    res.json({status: false, error: "No Class Found"})
  }
})

app.post("/addClasses", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const newClasses = []
    for (const classObj of req.body.classObjs) {
      if (!await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: classObj.id}}}).exec()) {
        await User.updateOne({id: verification.user.sub}, {$push: {classes: classObj}})
        newClasses.push(classObj)
      }
    }
    if (newClasses.length) {
      res.json({status: true, newClasses: newClasses})
    } else {
      res.json({status: false, error: "All Duplicate Classes - Make sure you are uploading new classes"})
    }
  }
})

app.post("/editClass", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const classObj = req.body.classObj
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.oldId}}}).exec()
    if (user) {
      const existingClassObj = user.classes.find(c => c.id == req.body.oldId)
      existingClassObj.id = classObj.id
      existingClassObj.name = classObj.name
      existingClassObj.period = classObj.period
      existingClassObj.students = classObj.students
      await user.save()
      res.json({status: true, updatedClass: existingClassObj})
    } else {
      res.json({status: false, error: "The class you are editing does not exist - Please reload"})
    }
  }
})

app.post("/deleteClass", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      user.classes.splice(user.classes.indexOf(user.classes.find(c => c.id == req.body.id)), 1)
      await user.save()
      res.json({status: true})
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

app.post("/randomGroups", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub}).exec()
    if (req.body.type == 0) {
      res.json({status: true, groups: makeGroupsByNumGroups(user.classes.find(c => c.id == req.body.id).students.map(s => s.id).filter(s => !req.body.excluded.includes(s)), req.body.num)})
    } else {
      res.json({status: true, groups: makeGroupsByNumStudents(user.classes.find(c => c.id == req.body.id).students.map(s => s.id).filter(s => !req.body.excluded.includes(s)), req.body.num)})
    }
  }
})

app.post("/addGrouping", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub}).exec()
    user.classes.find(c => c.id == req.body.id).groupings.push(req.body.grouping)
    user.save()
    res.json({status: true})
  }
})

app.post("/editGrouping", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub}).exec()
    const groupings = user.classes.find(c => c.id == req.body.id).groupings

    groupings.splice(groupings.indexOf(groupings.find(g => g.id == req.body.oldId)), 1)

    user.classes.find(c => c.id == req.body.id).groupings.push(req.body.grouping)
    user.save()
    res.json({status: true})
  }
})

app.post("/deleteGroup", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      const groupings = user.classes.find(c => c.id == req.body.id).groupings
      const grouping = groupings.find(g => g.id == req.body.groupingId)
      if (grouping) {
        groupings.splice(groupings.indexOf(grouping), 1)
        await user.save()
      res.json({status: true})
      } else {
        res.json({status: false, error: "No Group Found"})
      }
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

app.post("/addPreference", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      user.classes.find(c => c.id == req.body.id).preferences.push(req.body.preference)
      await user.save()
      res.json({status: true})
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

app.post("/deletePreference", async (req, res) => {
  const verification = await verifyUser(req.header("token"))
  if (verification.status) {
    const user = await User.findOne({id: verification.user.sub, classes: {$elemMatch: {id: req.body.id}}}).exec()
    if (user) {
      const preferences = user.classes.find(c => c.id == req.body.id).preferences
      const preference = preferences.find(p => p.id == req.body.preferenceId)
      if (preference) {
        preferences.splice(preferences.indexOf(preference), 1)
        await user.save()
        res.json({status: true})
      } else {
        res.json({status: false, error: "No Preference Found"})
      }
    } else {
      res.json({status: false, error: "No Class Found"})
    }
  }
})

app.use((req, res) => {
  res.sendFile(req.url, sendFileOptions, (e) => {
    if (e) {
      res.status(404).sendFile('/404/index.html', sendFileOptions)
    }
  })
})

app

//Listen
http.listen(process.env.PORT, function(){
	console.log(`Server listening on *:${process.env.PORT}`)
})


async function verifyUser(token) {
  const ticket = await oAuth2Client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID
  }).catch(e => {
    return {status: false}
  })
  return {status: true, user: ticket.getPayload()}
}


function makeGroupsByNumGroups(students, numGroups) {
  students = [...students]
  let groups = []
  for (let i = 0; i < numGroups; i++) {
    groups.push([])
  }

  let counter = 0
  while (students.length) {
    const randomIndex = Math.floor(Math.random() * students.length)
    groups[counter].push(students[randomIndex])
    students.splice(randomIndex, 1)
    counter = (counter+1) % groups.length
  }
  return groups
}

function makeGroupsByNumStudents(students, numStudents) {
  students = [...students]
  let groups = []
  let numGroups = Math.floor(students.length/numStudents)
  if ((students.length % numStudents > numStudents / 2 || students % numStudents > numGroups / 2)) {
    numGroups += 1
  }
  
  for (let i = 0; i < numGroups; i++) {
    groups.push([])
  }

  let counter = 0
  
  while (students.length) {
    const randomIndex = Math.floor(Math.random() * students.length)
    groups[counter].push(students[randomIndex])
    students.splice(randomIndex, 1)
    counter = (counter+1) % groups.length
  }
  
  // const avg = groups.reduce((a, b) => a + b.length, 0) / groups.length
  // console.log(avg)

  // if (avg > numStudents + 0.5 || avg < numStudents - 0.5) {
  //   console.log("weird")
  // }

  return groups
}




// mean the #s group > groups of x => warning

// greater > x => Warning


// < Half > Merge last group




/*
User Schema
{
  id: "user id",
  classes: [
    {
      name: "class name",
      period: "period number (as a string)",
      students: [
        {
          id: "student id",
          first: "first name",
          middle: "middle initial",
          last: "last name",
          preferences: [
            {
              name: "name of preference"
              type: integer representing type of preference (categorical, discrete, continuous),
              value: "value of preference" //may change because may not always be a string (ex. rate 1-5)
            }
          ]
        }
      ]
      groups: [
        {
          type: integer representing type of group (random etc),
          groupings: [["student id"]]
        }
      ]
    }
  ]
}
*/