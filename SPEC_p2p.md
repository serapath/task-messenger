# p2p data structure 

## Operations

### Invite/Join Operation
1. There is no such thing as invite.
2. The first time Ana needs to get the invite code to task 1 through other means.
3. Once Ana has the code. She can paste it and click join. A msg to create and append his writeable chatlog is sent to bob or maybe Ana can append this and notify Bob.
4. The invite code is maybe `bob_id+task_id`.
5. Two chat logs are appended to the DB. `ana_id+bob_id+task_id` by ana and `bob_id+ana_id+task_id` by bob.
### Chatlog message communication
1. Bob append a message to chatlog `bob_id+ana_id+task_id`
2. Bob pings Ana or sends the latest length of the chatlog to Ana
3. Ana queries the DB using the index or maybe just checks the last appended message.

## Modules

### Journaling Book Database (DB) [code](https://github.com/alyhxn/task-messenger/blob/master/src/node_modules/DB/DB.js)
- Represents `hypercore`(book) and `corestore`(db)
- Uses localStorage to store messages
- Contains books/arrays
- The books contain append only pages/array items (read/write operations only)
- A book can only be populated by its author
- Peers registered as reader are notified when there is a change in the book
  #### Data Structure of DB (localStorage)
  ```json
  {
  "book_pk1": { pk, pages: [] },
  "book_pk2": { pk, pages: [] },
  "book_pk3": { pk, pages: [] },
  // ...
    "peer_pk1": {
      "titled": {
        "<book2_name>": "<book2_pk>",
        "<book3_name>": "<book3_pk>",
        // ...
      },
      "books": {
        "<book2_pk>": "<sk2>",
        "<book3_pk>": "<sk2>",
        "<book4_pk>": null, // readonly
        // ...
      }
    },
    "peer_pk2": { /* ... */ },
    "peer_pk3": { /* ... */ },
    // ...
  } 
  ```

  [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1239635191216214137)

### peer to peer networking (IO) [code](https://github.com/alyhxn/task-messenger/blob/master/src/node_modules/IO/IO.js)
- Represents `hyperswarm`
- Used to send messages
- Uses `MessageChannel`
- Message content should be minimal
- Should be avoided when possible

### vault [code](https://github.com/alyhxn/task-messenger/blob/master/src/node_modules/vault/vault.js)
- A module to initialize DB and IO for a peer

### peer [code](https://github.com/alyhxn/task-messenger/blob/master/demo/p2p.js)
- A module meant to be controlled by the peer
- Manages communiction through IO
- Appends/reads data from DB
- Handles task messenger

### devtools [code](https://github.com/alyhxn/task-messenger/blob/master/demo/devtools.js)
- A module for debugging
- Equiped with tools to quickly catch an error

  [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1238882893011484762)

## Summary
- ### Goal
  To get our way of building apps compatible with peer to peer and later on as a set of techniques and modules anyone can use to build their p2p apps, so we need to really think about these things and the task messenger is more like the demo app which we can use to practice this stuff and try out. 
  
  [ref1](https://discord.com/channels/859134561018839060/1235708415322361966/1235708587234562099) [ref2](https://discord.com/channels/859134561018839060/1219764849349755053/1236703180528549919) [ref3](https://discord.com/channels/859134561018839060/1235708415322361966/1236454496188633239) [ref4](https://discord.com/channels/859134561018839060/1235708415322361966/1237797514405740675)
- ### Naming convention
  We want the variable names everywhere to be as simple and meaningful as possible. E.g. for a book whose author is ana and reader is bob then we will name it as `${bob_id}-${ali_id}`. If this book belongs to task1 then will will name it `${bob_id}-${ali_id}-${task1_id}`.
  [ref1](https://discord.com/channels/859134561018839060/1235708415322361966/1235718837765410919) [ref2](https://discord.com/channels/859134561018839060/1235708415322361966/1235711458487308409)
- ### peer implementation
  Every peer has a function in his/her name inwhich the script of his/her interations with other peers is included besides the initialization described in [peer](#peer). [ref1](https://discord.com/channels/859134561018839060/1235708415322361966/1236072153569296415) [ref2](https://discord.com/channels/859134561018839060/1235708415322361966/1236430075650379806)
- ### Introduction to financial book keeping 
  Imagine a system where users interact through a unique form of communication, resembling books with transparent, sealed pages. Each "book" represents a conversation between two users, with only one author per book. Users can copy pages from others' books to compile their own records.

  Here's how it works:

  1. Users initiate conversations by creating their own "books" with titles indicating the recipient's name and purpose (e.g., "Bob" and "Chat").
  2. They then write messages on individual pages, which are permanently sealed once added to the book.
  3. Conversations progress as users exchange these "books," copying pages to compile their own records.
  4. Users can create new books containing pages copied from others, consolidating their conversations.
 [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1236431670182285383)

- ### Minimum use of `IO`
  `IO` can only be used to establish connections not to send messages or even index of new messages because now `DB` notifies the readers itself.
  [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1237085298467536976)

- ### Establishing Connection/protocol b/w two peers
  To establish a connection, Bob initiates a handshake protocol:

  1. Bob connects to Ana's address.
  2. Bob creates or loads a book named `${bob_id}-${ana_id}`.
  3. If new, Bob adds Ana's address as the first page.
  4. Bob sends the book's random ID to Ana.
  5. Ana receives the ID and accesses the book.
  6. Ana creates or loads a book named `${ana_id}-${bob_id}`.
  7. If new, Ana adds Bob's address as the first page.
  8. Ana sends the book's random ID to Bob.
  9. Bob receives the ID and accesses the book.

  Now both peers are connected and can communicate.
  [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1237205792789237860)

- ### standard msg format
  ```js
    const message = {
      head, refs, type, data, meta
    }
  ```
  
  [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1239312712668811444)

- ### Book/Chatlog Management
  So the chat between two peers happens using two books in DB, one for each peer as the author and the other as a reader. In this way, if we have multipe peers in a chat or task, then the number of books will increase according to permutations of no. of peers `n` taken 2 at a time (nP2).

  [ref](https://discord.com/channels/859134561018839060/1235708415322361966/1235713825223737375)

## Remaining
- peer to peer disconnection and reconnection
