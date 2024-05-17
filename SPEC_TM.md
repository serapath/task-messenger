# Task Messenger

### Goals
1. we want all user interaction recorded and potentially replayable (redo/undo)
2. we want the current state of the task structure saved (so we can load or restore it from a database without the need to replay all the interaction again
3. we want to store task data structure and UI state separately
4. we want to be able to export those to a json file
5. we want to be able to import that from a json file
6. we want it to be as fast and small as possible
7. even if we have gazillions of tasks we want it to be smart when lazy loading and scrolling around to scale perfectly.
8. we want all this functionality small and modular (hopefully DB and IO module will be enough for all of this) and api surface to stay lean so others can easily learn and use our techniques as well
9. We want 3 additional debug buttons
    - reset -> to reset the localStorage
    - export -> to export current task structure to a json file (we have that i guess)
    - import -> to import a json file and overwrite the current task structure with the imported version
10. we will just avoid lots of data to store everything in localStorage and later when we have it, we can update it to e.g. [kv-idb](https://www.npmjs.com/package/kv-idb) that uses indexdb so you have unlimited storage space
11. Code for random data generation [link](https://colab.research.google.com/drive/1ZZuJpI9AsCcKDaEU5pePfrT5vqxmT5kW#scrollTo=PDCgHqFE_h9Y)
12. Let's assume we will pass to DB(....) many params
    - seed
    - storage (e.g. localStorage vs. {})
    - hook (optional callback)
      
    if we pass localStorage, then all interaction persists. If we pass an object, then it is only stored in memory and lost on reload
