import { format } from 'date-fns';
import Link from 'next/link';
import useSWR from 'swr';
import { Update, User } from '../utils/types';
import { dateOnly } from '../utils/utils';

export default function TopThree(props: {
  user: User;
  update: Update;
}) {
	const { data: top } = useSWR(
		`/api/get-top-three?userId=${props.update.userId}&updateId=${props.update._id}`
	);
	if (top=== undefined) {
		return;
	}
  console.log(top)
	return (
		<>
			{top.data.map((update, index) => (
				<div
					className={`mb-8 leading-snug opacity-50 hover:opacity-100 transition dark:opacity-75`}
					key={index}
				>
					<Link href={`/@${props.user.urlName}/${update.url}`} shallow={false}>
						<a>
							<div className='font-bold'>
								<span>
									{format(dateOnly(update.date), 'MMMM d, yyyy')}
								</span>
							</div>
							<div>
								<span>{update.title}</span>
							</div>
						</a>
					</Link>
				</div>
			))}
		</>
	);
}
