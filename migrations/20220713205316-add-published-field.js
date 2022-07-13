module.exports = {
  async up(db, client) {
    await db.collection("updates").update({}, {
      $set: {
        published: true,
      }
    }, {upsert: false, multi: true});
  },

  async down(db, client) {
  }
};
