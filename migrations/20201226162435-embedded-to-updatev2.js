module.exports = {
  async up(db, client) {
    const users = db.collection("users");
    const usersCursor = await users.find();
    while (await usersCursor.hasNext()) {
      const userData = await usersCursor.next();
      if (userData.updates) {
        for (let update of userData.updates) {
          await db.collection("updates").insertOne({
            ...update,
            userId: userData._id,
          });
        }
        await db.collection("users").updateOne({id: userData._id}, {
          $set: {updates: []},
        });
      }
    }
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
