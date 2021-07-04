import Phaser from "phaser";
import Card from '../helpers/card';
import info from "./info.json"
import Base from '../helpers/base'

class playGame extends Phaser.Scene {
  constructor() {
    super({
      key: "game"
    });
  }

  preload() {
    this.load.image('blueBase', 'src/assets/Blue/Base.png');
    this.load.image('blueBaseW', 'src/assets/Blue/BaseW.png');
    this.load.image('blueDisc', 'src/assets/Blue/Disc.png');
    this.load.image('blueFlower', 'src/assets/Blue/Flower.png');
    this.load.image('blueSkull', 'src/assets/Blue/Skull.png');

    this.load.image('greenBase', 'src/assets/Green/Base.png');
    this.load.image('greenBaseW', 'src/assets/Green/BaseW.png');
    this.load.image('greenDisc', 'src/assets/Green/Disc.png');
    this.load.image('greenFlower', 'src/assets/Green/Flower.png');
    this.load.image('greenSkull', 'src/assets/Green/Skull.png');

    this.load.image('pinkBase', 'src/assets/Pink/Base.png');
    this.load.image('pinkBaseW', 'src/assets/Pink/BaseW.png');
    this.load.image('pinkDisc', 'src/assets/Pink/Disc.png');
    this.load.image('pinkFlower', 'src/assets/Pink/Flower.png');
    this.load.image('pinkSkull', 'src/assets/Pink/Skull.png');

    this.load.image('purpleBase', 'src/assets/Purple/Base.png');
    this.load.image('purpleBaseW', 'src/assets/Purple/BaseW.png');
    this.load.image('purpleDisc', 'src/assets/Purple/Disc.png');
    this.load.image('purpleFlower', 'src/assets/Purple/Flower.png');
    this.load.image('purpleSkull', 'src/assets/Purple/Skull.png');
      
    this.load.image('redBase', 'src/assets/Red/Base.png');
    this.load.image('redBaseW', 'src/assets/Red/BaseW.png');
    this.load.image('redDisc', 'src/assets/Red/Disc.png');
    this.load.image('redFlower', 'src/assets/Red/Flower.png');
    this.load.image('redSkull', 'src/assets/Red/Skull.png');
      
    this.load.image('yellowBase', 'src/assets/Yellow/Base.png');
    this.load.image('yellowBaseW', 'src/assets/Yellow/BaseW.png');
    this.load.image('yellowDisc', 'src/assets/Yellow/Disc.png');
    this.load.image('yellowFlower', 'src/assets/Yellow/Flower.png');
    this.load.image('yellowSkull', 'src/assets/Yellow/Skull.png');
      
    this.load.image("backdrop", 'src/assets/table.jpg'); 
  }

  createBases = (bases) => {

    for(let y = 0; y < 2; y++){
      for(let x = 0; x < 3; x++){
        let xy = x + 3*y
        bases[xy] = new Base(this).render(info.base.x[x], info.base.y[y], info.colors[xy] + "Base").setName(info.colors[xy]).on('pointerdown', function () {
          this.scene.socket.emit("selectbase", this.scene.me, this.name)
        }, this.bases[xy])
      }
    }

  }

  setBasesInteractive = (bases, value) => {
    bases.forEach(base => { value ? base.setInteractive() : base.disableInteractive()})
  }

  createCards = (color) => {
    this.cards = []
    for(let i = 0; i < 3; i++){
      this.cards[i] = new Card(this, color, "Flower", true).render()
    }
    this.cards[3] = new Card(this, color, "Skull", true).render()
    for(let i = 0; i < 4; i++){
      this.cards[i].num = i
      this.cards[i].setInteractive({draggable: false})
      this.input.setDraggable(this.cards[i])
      this.cards[i].on('pointerover', function() {!this.isDown ? this.y = info.cards.y-50 : null}, this.cards[i])
      this.cards[i].on('pointerout', function() {!this.isDown ? this.y = info.cards.y : null}, this.cards[i])
    }
  }

  resetCards = () => {
    this.highestBid = 0
    this.currentBid = 1
    this.bidding = false
    this.flipping = false
    this.flipped = 0
    this.bidNum.setText(1)
    this.biddingOBJs.forEach(obj => {
      obj.disableInteractive().visible = false
    })
    this.players.forEach(player => player ? player.isFolded = false : null)
    this.info.visible = false
    this.foldText.disableInteractive().visible = false
    this.bases.forEach(base => {
      if(base.visible){
        let num = info.colors.indexOf(base.name)
        let x = num >= 3 ? num-3 : num
        let y = Math.floor(num/3)
        base.x = info.base.x[x]
        base.y = info.base.y[y]
      }
    })
    if(this.cards){
      for(let i = 0; i < 4; i++){
        if(!this.cards[i].isDisabled){
          this.cards[i].x = info.cards.x[i]
          this.cards[i].y = info.cards.y
          this.cards[i].setInteractive()
          this.cards[i].visible = true
          }
        } 
    }
    for(let i = 0; i < this.faceDownCards.length; i++){
      this.faceDownCards[i].destroy()
    }
    this.faceDownCards = []
  }

  resetCard = (card) => {
    card.x = info.cards.x[card.num]
    card.y = info.cards.y
  }

  selectBase = (user, color) => {
    user.folded = false 
    user.hasLost = false 
    user.isPlaying = true
    this.players[info.colors.indexOf(color)] = user 
    let num = info.colors.indexOf(color)
    let x = num >= 3 ? num-3 : num
    let y = Math.floor(num/3)
    this.bases[num].visible = false 
    this.bases[num].disableInteractive()
    if(user.id === this.me.id){
      this.me.isPlaying = true 
      this.me.isFolded = false 
      this.me.hasLost = false
      this.color = color 
      this.zone = this.add.zone(info.base.x[x], info.base.y[y], 0, 0).setCircleDropZone(info.base.r)
      this.zone.disableInteractive()
      this.setBasesInteractive(this.bases, false)
      this.text.setText("You are playing as " + color)
    }
    if(this.getNumberOfPlayers(this.players) >= 2 && this.me.host && this.me.isPlaying){
      this.startGameText.setInteractive().visible = true
    }
    
  }
  
  

  getNumberOfPlayers = (players) => {
    let count = 0
    players.forEach(player => {
      player ? count++ : null
    })
    return count
  }


  setTurn = (color) => {
    this.text.setText("It is " + color + "'s turn.").visible = true
    this.turn = color
    if(this.turn == this.color){
      if(this.faceDownCards.filter(a => a.obj.color === this.color).length > 0){
        this.biddingOBJs.forEach(obj => {
          obj.visible = true
          obj.setInteractive()
        })
      }
      console.log(this.bidding)
      this.bidding ? this.foldText.setInteractive().visible = true : this.zone.setInteractive()
      if(this.bidding && (this.bidder === color)){
        this.info.setText(color + " has to flip " + this.highestBid + " to win the turn.")
        console.log("flipping")
        this.flipping = true
        this.faceDownCards.forEach(card => card.setInteractive())
        this.biddingOBJs.forEach(obj => {
          obj.disableInteractive().visible = false 
        })
        this.foldText.disableInteractive().visible = false 
      }
    }
    else{
      if(this.bidding && this.bidder === color){
        this.info.setText(color + " has to flip " + this.highestBid + " to win the turn.")
        console.log("flipping")
        this.flipping = true
        this.foldText.disableInteractive().visible = false
      }
      this.biddingOBJs.forEach(obj => {
        obj.visible = false
        obj.disableInteractive()
      })
      this.bidSubmit.disableInteractive()
      this.zone ? this.zone.disableInteractive() : null
    }
  }

  fold = (color) => {
    let num = info.colors.indexOf(color)
    this.players[num].isFolded = true
    let x = num >= 3 ? num-3 : num
    let y = Math.floor(num/3)
    this.bases[num].x = info.base.fold.x[x]
    this.bases[num].y = info.base.fold.y[y]
    this.faceDownCards.forEach(card => {
      if(card.obj.color == color){
        card.x = info.base.fold.x[x]
        card.y = info.base.fold.y[y]
      }
    })
    if(this.color === this.turn){
      this.foldText.disableInteractive().visible = false
    }
    this.setNextTurn(color)
  }

  onlyLeft = (current) => {
    for(var i = 0; i < 6; i++){
      if(!(i == current)){
        if(this.players[i]){
          if(!this.players[i].hasLost){
            return false
          } else {
          }
        }
      }
    }
    return true
  }

  setNextTurn = (current) => {
    let currentNum = info.colors.indexOf(current)
    let counter = 0
    while(true){
      counter++
      if(counter > 10){
        this.add.text(700,400,"Game over")
        this.turn = null 
        break
      }
      currentNum == 5 ? currentNum = 0 : currentNum+=1
      if(this.players[currentNum]){
        if(this.players[currentNum].hasLost){
          continue
        }
        if(this.bidding && this.players[currentNum].isFolded){
          continue
        }
        if(this.onlyLeft(currentNum)){
          this.text.setText(`${info.colors[currentNum]} wins!`)
          this.info.visible = false
          if(this.color === info.colors[currentNum]){ 
            this.resetButton.setInteractive().visible = true
          }
          this.turn = null
        } else {
          console.log(this.players[currentNum])
          this.setTurn(info.colors[currentNum])
        }
        break
      }
    }
  }

  setToRemove = (card) => {
    for(let i = 0; i < 4; i++){
      if(!this.cards[i].isDisabled && this.cards[i].obj.type == card.obj.type){
        this.cards[i].isDisabled = true
        this.cards[i].visible = false
        this.cards[i].disableInteractive()
        break
      }
    }
    this.socket.emit("chooseremove", card.obj.color, this.me.room)
  }

  chooseRemove = (color) => {
    console.log(color + " has removed a card.")
    this.resetCards()
    this.setTurn(color)

  }

  pickDisks = () => {
    this.pickCards = []
    this.cards.forEach(card => {
      card.isDisabled ? this.pickCards.push(null) : this.pickCards.push(new Card(this, this.color, card.obj.type, true).render().setInteractive().on('pointerdown', function () {
        this.scene.setToRemove(this)
        this.scene.pickCards.forEach(card => card ? card.destroy() : null)
      }))
    })
    for(let i = 0; i < 4; i++){
      if(this.pickCards[i]){
        this.pickCards[i].x = info.cards.x[i]
        this.pickCards[i].y = info.cards.pickY
      }
    }
  }

  getNumberOfDisks = () => {
    let count = 0
    this.cards.forEach(card => card.isDisabled ? null : count++)
    return count

  }


  selectDownDisk = (color) => {
    let disk = null
    for(let i = this.faceDownCards.length-1; i >= 0; i--){
      if(this.faceDownCards[i].obj.color === color && !this.faceDownCards[i].obj.flipped){
        disk = this.faceDownCards[i]
        break
      }
    }
    disk.obj.flip()
    disk.y += 200
    disk.disableInteractive()
    this.flipped++
    if(disk.obj.flipped && disk.obj.type == "Skull"){
      if(this.turn === this.color){
        if(this.getNumberOfDisks() === 1){
          console.log("should have lost")
          this.bases[info.colors.indexOf(this.color)].disableInteractive()
          this.zone.disableInteractive()
          this.cards.forEach(card => card.isDisabled ? null : card.isDisabled = true)
          this.socket.emit("playerlost", this.color, this.me.room)
        } else {
          this.pickDisks()
        }
      } else {
        this.info.setText(this.turn + " is choosing a card to get rid of.")
      }
    }else{
      if(this.flipped == this.highestBid){
        if(!this.bases[info.colors.indexOf(this.turn)].obj.flipped){
          this.bases[info.colors.indexOf(this.turn)].obj.flip()
          this.resetCards()
          this.setTurn(this.turn)
        }else{
          this.text.setText(`${this.turn} wins!`)
          this.info.visible = false
          if(this.turn === this.color){
            this.resetButton.setInteractive().visible = true
          }
          this.turn = null
        }
      }
    }
  }

  startGame = (first) => {
    this.bases.forEach(base => {
      base.visible ? base.visible = false : base.visible = true
    })
    this.text.visible = false 
    this.startGameText ? this.startGameText.disableInteractive().visible = false : null
    if(this.color){
      this.createCards(this.color)
      this.resetCards(this.color)
    }
    this.setNextTurn(info.colors[first])
  }

  playCard = (gameObject) => {
    //create card at correct position of correct type and set next turn
    let newCard = new Card(this,gameObject.color, gameObject.type, false).render()
    newCard.on('pointerdown', function () {
      if(this.scene.faceDownCards.filter(a => a.obj.color === this.scene.color && !a.obj.flipped).length !== 0 && this.obj.color !== this.scene.color){
        //error sound or text or something
      } else {
        this.scene.socket.emit("flipcard", this.obj.color, this.scene.me.room)
      }
    }, newCard)
    let num = info.colors.indexOf(gameObject.color)
    let x = num >= 3 ? num-3 : num
    let y = Math.floor(num/3)
    newCard.x = info.base.x[x]
    newCard.y = info.base.y[y]
    this.faceDownCards.push(newCard)
    this.setNextTurn(this.turn)
  }

  bid = (color, bid) => {
    //set current bid to bid, set bidder to color and set next turn
    this.highestBid = bid 
    this.bidder = color
    this.info.setText("Current bid is " + bid + " by " + color)
    if(!this.bidding){
      this.bidding = true 
      this.cards ? this.cards.forEach(card => {card.disableInteractive()}) : null
      this.info.visible = true
    }
    if(this.faceDownCards.length === this.highestBid){
      for(let i = 0; i < this.players.length; i++){
        if(i === info.colors.indexOf(color)){
          continue
        }
        if(this.players[i]){
          this.fold(info.colors[i])
        }
      }
    } else {
      this.currentBid = bid+1
      this.bidNum.setText(bid+1)
    }
    this.setNextTurn(color)
  }

  playerLost = (color) => {
    this.bases[info.colors.indexOf(color)].visible = false
    this.players[info.colors.indexOf(color)].hasLost = true
    this.info.setText(color + " has lost!")
    this.resetCards()
    console.log("player lost, setting next turn to " + color)
    this.setNextTurn(color)
  }

  setUpSocket = (socket) => {
    let self = this
    socket.on("userjoined", (user) => {
      console.log(user.name + " has joined the room")
      //add player to lobby ?
    })
    socket.on("userplaying", self.selectBase)
    socket.on("initgame", (game, user) => {
      //set up players, makes objects visible, loop through events
      self.me = user
      game.events.forEach(event => {
        console.log(event)
        self.functionMap[event.name](...event.args)
      })
    })
    socket.on("startgame", self.startGame)
    socket.on("resetgame", self.resetGame)
    socket.on("playcard", self.playCard)
    socket.on("fold", self.fold)
    socket.on("bid", self.bid)
    socket.on("flipcard", self.selectDownDisk) 
    socket.on("chooseremove", self.chooseRemove)
    socket.on("playerlost", self.playerLost)
    socket.on("wingame", (player) => {
      //display text indicating player has won the game, reset game
    })

  }

  resetGame = () => {
    for(let y = 0; y < 2; y++){
      for(let x = 0; x < 3; x++){
        let xy = x + 3*y
        this.bases[xy].x = info.base.x[x]
        this.bases[xy].y = info.base.y[y]
        this.bases[xy].obj.flipped ? this.bases[xy].obj.flip() : null
        this.color ? this.bases[xy].disableInteractive().visible = true : this.bases[xy].setInteractive().visible = true 
      }
    }
    this.cards.forEach(card => card.destroy())
    this.cards = []
    this.faceDownCards.forEach(card => card.destroy())
    this.faceDownCards = []
    this.biddingOBJs.forEach(obj => obj.disableInteractive().visible = false)
    this.turn = null 
    this.bidding = false 
    this.flipping = false 
    this.players.forEach(player => {
      if(player){
        player.hasLost = false 
        player.isFolded = false
      }
    })
    this.resetButton.disableInteractive().visible = false
    this.info.setText("").visible = false
    this.color ? this.text.setText("Waiting for game to start") : this.text.setText("Select a color by clicking on a mat.")
    if(this.getNumberOfPlayers(this.players) >= 2 && this.me.host && this.me.isPlaying){
      this.startGameText.setInteractive().visible = true
    }
    let color = this.color 
    this.color = null 
    this.players = [null,null,null,null,null,null]
    this.socket.emit("selectbase", this.me, color)
  }

  create(data) {
    console.log(data)
    this.socket = data.socket 
    this.users = []
    this.setUpSocket(this.socket) 
    this.socket.emit("join")
    this.players = [null,null,null,null,null,null]
    this.turn = null
    this.bidding = false
    this.flipping = false
    this.flipped = 0
    this.biddingOBJs = []


    this.add.image(0,0,"backdrop")

    this.info = this.add.text(1000,500,"Current bid is 0 by null")
    this.info.visible = false

    this.bidUp = this.add.text(1300,400,"Add").on('pointerdown', function() {this.scene.faceDownCards.length > this.scene.currentBid? this.scene.bidNum.setText(++this.scene.currentBid) : null})
    this.bidUp.visible = false
    this.bidNum = this.add.text(1250,400,"1")
    this.bidNum.visible = false
    this.bidDown = this.add.text(1200,400,"Sub").on('pointerdown', function () {this.scene.currentBid > 1 && this.scene.currentBid > this.scene.highestBid+1 ? this.scene.bidNum.setText(--this.scene.currentBid) : null})
    this.bidDown.visible = false
    this.bidSubmit = this.add.text(1250,450,"Submit").on('pointerdown', function () {
      this.scene.socket.emit("bid", this.scene.color, this.scene.currentBid, this.scene.me.room)
    })

    this.startGameText = this.add.text(1000,600,"Start Game").on("pointerdown", function() {
      this.scene.socket.emit("initgame", this.scene.me.room)}).disableInteractive()
    this.startGameText.visible = false

    this.foldText = this.add.text(1300, 500, "Fold").on('pointerdown', function () {this.scene.socket.emit("fold", this.scene.color, this.scene.me.room)})
    this.foldText.visible = false

    this.bidSubmit.visible = false

    this.biddingOBJs.push(this.bidUp)
    this.biddingOBJs.push(this.bidNum)
    this.biddingOBJs.push(this.bidDown)
    this.biddingOBJs.push(this.bidSubmit)

    this.resetButton = this.add.text(1000,450,"Reset game").on('pointerdown', function() {this.scene.socket.emit("resetgame", this.scene.me.room)}).disableInteractive()
    this.resetButton.visible = false

    this.bases = []
    this.faceDownCards = []
    //set on game create 
    this.createBases(this.bases)
    this.setBasesInteractive(this.bases,true)
    this.text = this.add.text(520,400,"Select a color by clicking on a mat.")

    this.input.on('drag', function (pointer, gameObject, x, y) {
      gameObject.x = x
      gameObject.y = y
    })

    this.input.on('dragstart', function(pointer, gameObject) {
      this.children.bringToTop(gameObject)
    }, this)

    this.input.on('dragend', function(pointer, gameObject, dropped){
      if(!dropped){
        gameObject.scene.resetCard(gameObject)
        gameObject.isDown = false
      }else{
        gameObject.isDown = true
        gameObject.disableInteractive()
        gameObject.visible = false
        gameObject.scene.socket.emit("playcard", gameObject.scene.me.room, gameObject.obj)


      }
    })
   
  }

  functionMap = {
    "selectbase": this.selectBase,
    "startgame": this.startGame,
    "playcard": this.playCard,
    "bid": this.bid,
    "fold": this.fold,
    "flipcard": this.selectDownDisk,
    "chooseremove": this.chooseRemove,
    "playerlost": this.playerLost
  }


}



export default playGame;