module.exports = {
  async up(db, client) {
    await db.collection("users").update({}, {
      $set: {
        truePrivate: false,
      }
    }, {upsert: false, multi: true});
  },
};
