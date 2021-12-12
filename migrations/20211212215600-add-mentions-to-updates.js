module.exports = {
  async up(db, client) {
    await db.collection("users").update({}, {
      $unset: {
        updates: [],
      }
    }, {upsert: false, multi: true});

    await db.collection("updates").update({}, {
      $unset: {
        comments: [],
      }
    }, {upsert: false, multi: true});

    await db.collection("updates").update({}, {
      $set: {
        mentionedUsers: [],
      }
    }, {upsert: false, multi: true});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
