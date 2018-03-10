const Benchmark = require('benchmark')

const {
  message,
  Message,
//  MessageError,
  MessageData,
} = require('../../Message')

const {
//  SocketMessage,
  SocketMessageReply,
//  SocketMessageAction,
//  SocketMessageTransaction
} = require('../../SocketMessage')

class A {
}
class B extends A{
}

let suite = new Benchmark.Suite()

suite.add('A', function testA(){
  return new A()
})
suite.add('B', function testB(){
  return new B()
})
suite.add('Message', function nativeComparison(){
  return new Message()
})
suite.add('MessageData', function testMessageData(){
  return new MessageData({ some: 'data' })
})
suite.add('SocketMessage', function testSocketMessage(){
  return new MessageData('event', { some: 'data' })
})
suite.add('SocketMessageReply', function testSocketMessageTransaction(){
  return new SocketMessageReply('trevent', { some: 'data' }, { replyid: '12341234-1234-1234-1234-123412341234' })
})
suite.add('plain message', function testmessage(){
  return message()
})

/* eslint-disable no-console */
.on('cycle', event => console.log(String(event.target)) )
.on('error', error => console.error('error', error.target.error) )
.on('complete', function(){ 
  console.log('Fastest is ' + this.filter('fastest').map('name')) 
})
.run({ 'async': false })
