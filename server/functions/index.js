const functions = require('firebase-functions');
const express = require('express')
const cors = require('cors')
const admin = require('firebase-admin')

const app = express()
app.use(cors({ origin: true }))

const serviceAccount = require('./serviceAccountKey.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://aucfine.firebaseio.com'
})

app.get('/make-bid', async (req, res) => {
  const tokenId = req.get('Authorization').split('Bearer ')[1]

  try {
    const decodedToken = await admin.auth().verifyIdToken(tokenId)
    res.send(decodedToken)
  } catch (err) {
    res.status(401).send(err)
  }
})

app.get('/auctions', (req, res) => {
  try {
    admin.database().ref('/auctions').once('value', snap => {
      res.send(snap.val())
    })
  } catch (err) {
    res.status(500).send(err)
  }
})

// Add auction
app.post('/admin/auction', async (req, res) => {
  try {
    const { title, desc, startPrice, startTime, images } = req.body

    await admin.database().ref('/auctions').push({
      title,
      desc,
      startPrice,
      startTime,
      images
    })

    res.send(true)
  } catch (err) {
    res.status(500).send(err)
  }
})

app.delete('/admin/auction', async (req, res) => {
  try {
    await admin.database().ref(`/auctions/-${req.query.id}`).remove()

    res.send(true)
  } catch (err) {
    res.status(500).send(err)
  }
})

app.put('/admin/auction', async (req, res) => {
  try {
    const { title, desc, startPrice, startTime, images } = req.body

    await admin.database().ref(`/auctions/-${req.query.id}`).update({
      title,
      desc,
      startPrice,
      startTime,
      images
    })

    res.send(true)
  } catch (err) {
    res.status(500).send(err)
  }
})

exports.api = functions.https.onRequest(app)