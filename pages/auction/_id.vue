<template>
  <div class="product">
    <div class="info">
      <h1>{{auction.title}}</h1>
      <div v-if="startTime <= 0" class="current-data">
        <div class="timer">00:00:{{currentTime}}</div>
        <div class="buyer">{{auction.buyer}}</div>
      </div>
      <p
        class="desc"
      >{{auction.desc}}</p>
      <div v-if="startTime > 0" class="starts-in-container">
        <p class="starts-in">Початок через:</p>
        <div class="btn no-btn">
          {{msToTime(startTime).h}}год {{msToTime(startTime).m}}хв {{msToTime(startTime).s}}с
        </div>
      </div>
      <div v-else class="price-container">
        <p class="price">Ціна: {{auction.currentPrice}} грн</p>
        <div v-if="currentTime > 0" @click="makeBid(`-${$route.params.id}`)" class="btn">Підняти ставку</div>
        <div v-else class="btn no-btn">Продано</div>
      </div>
      <div class="btn buy-it-now">Купити зараз за {{auction.price}} грн</div>
    </div>

    <div class="views">
      <img class="main-img" :src="mainPhoto" alt="main" />

      <div class="other-img">
        <img
          v-for="(photo, index) in auction.images"
          :key="index"
          :src="`data:image/png;base64,${photo}`"
          alt="Auction photo"
          @click="changePhoto(photo)"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase'
  import axios from 'axios'

  export default {
    data() {
      return {
        mainPhoto: null,
        auction: {},
        currentTime: null,
        startTime: null
      }
    },
    methods: {
      changePhoto(photo) {
        this.mainPhoto = `data:image/png;base64,${photo}`
      },
      makeBid: async (auctionId) => {
        const token = await firebase.auth().currentUser.getIdToken(true)

        axios.get(`${process.env.BASE_API}/make-bid?id=${auctionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => {
          console.log(res.data)
        })
      },
      updateTime() {
        this.startTime = new Date(this.auction.startTime) - new Date()

        this.currentTime = this.msToSeconds(
          new Date(this.auction.currentTime) - new Date() > 0 ? new Date(this.auction.currentTime) - new Date() : 0
        )
        this.currentTime = this.currentTime < 10 ? '0' + this.currentTime : this.currentTime
      },
      msToTime(ms) {
        let s = Math.floor(ms / 1000)
        let m = Math.floor(s / 60)
        s = s % 60
        let h = Math.floor(m / 60)
        m = m % 60

        return { s, m, h }
      },
      msToSeconds(ms) {
        return Math.floor(ms / 1000)
      }
    },
    mounted() {
      firebase.database().ref(`/auctions/-${this.$route.params.id}`).on('value', snap => {
        this.auction = snap.val()
        this.changePhoto(this.auction.images[0])

        this.updateTime()

        setInterval(() => {
          this.updateTime()
        }, 1000)
      })
    }
  }
</script>

<style lang="sass" scoped>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro&display=swap')

  .product
    display: flex
    justify-content: center
    margin-top: 50px

    .info
      width: 500px
      margin-right: 50px
      
      h1
        font-size: 35px
        font-family: 'Source Sans Pro', sans-serif
        letter-spacing: 2px

      .current-data
        display: flex
        justify-content: space-between
        align-items: center

        .timer
          font-size: 30px
          color: red
          letter-spacing: 5px

        .buyer
          margin-left: 20px
          font-size: 18px
      
      .desc
        margin-top: 15px
        font-size: 17px
        color: #333

      .starts-in-container, .price-container
        display: flex
        justify-content: space-between
        align-items: center
        width: 350px
        margin: 50px 0

      .price, .starts-in
        font-size: 20px
        font-weight: bold
        color: #333
        letter-spacing: 1px
      
      .btn
        width: 180px
        text-align: center
        padding: 10px
        background: #555
        color: #FFF
        border-radius: 10px
        font-size: 18px
        letter-spacing: 1px
        user-select: none
        cursor: pointer

        &.no-btn
          user-select: text
          cursor: text

        &.buy-it-now
          width: 350px

    .main-img
      height: 400px
      width: 400px
      object-fit: contain

    .other-img
      display: flex
      justify-content: center

      img
        width: 80px
        height: 80px
        margin: 15px
        border: 1px solid #999
        padding: 8px
        object-fit: contain
        cursor: pointer
</style>