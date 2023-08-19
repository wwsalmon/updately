import { updateModel } from '../../models/models';
import * as mongoose from 'mongoose';
import { Update, UpdateMetadata } from '../../utils/types';


export async function getSurroundingUpdateMetadata(authorId: string, updateUrl: string, showDrafts: boolean = false) {
	await mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});

    const currentUpdate: Update = await updateModel.findOne({ url: updateUrl });
    const projection = { $project: { date: 1, url: 1, title: 1, tags: 1, published: 1 } }
	const updatesAfter: UpdateMetadata[] = await updateModel.aggregate([
		{ $match: { date: { $gt: currentUpdate.date }, published: !showDrafts, userId: authorId} }, // date is after current update
		{ $sort: { date: 1, _id: 1 } },
		{ $limit: 2 },
		projection,
    ]);
    
    const updatesBefore: UpdateMetadata[] = await updateModel.aggregate([
        { $match: { date: { $lt: currentUpdate.date }, published: !showDrafts, userId: authorId} }, // date is after current update
		{ $sort: { date: -1, _id: 1 } },
		{ $limit: 7 },
		projection,
    ])
    // sorting is done client side
    const result = updatesBefore.concat(currentUpdate, updatesAfter)
    return result;
}
