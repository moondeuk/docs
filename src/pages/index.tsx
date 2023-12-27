import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { translate } from '@docusaurus/Translate';

import styles from './index.module.css';
import HomePage from '../components/Homepage';

function Home() {
	const context = useDocusaurusContext();
	let { siteConfig } = context;

	siteConfig.title = translate({
		id: 'global.title',
		message: siteConfig.title,
		description: 'The website title',
	});
	siteConfig.tagline = translate({
		id: 'global.tagline',
		message: siteConfig.tagline,
		description: 'The website tagline',
	});
	siteConfig.customFields.description = translate({
		id: 'global.description',
		message: siteConfig.customFields.description as string,
		description: 'The website description',
	});
	const lines = [
		translate({
			id: 'homepage.description.descriptionLine_1',
			message: 'Hello, I am Deukryong Moon (문득룡), commonly referred to as DR, which is a shortened version of it. I am an enthusiastic and self-motivated IT solution architect with over 15 years of extensive experience in developing manufacturing systems. I possess a diverse skill set and profound expertise in software development, encompassing the design, modification, and rigorous testing of technical architectures. Proficient across multiple programming languages, I have a robust understanding of business domain processes. My track record highlights successful endeavors in converting domain processes into efficient software solutions, consistently meeting project deadlines within demanding real-time environments.',
			description: 'The first line of description',
		})
	];

	return (
		<Layout
			title={siteConfig.title}
			description={siteConfig.customFields.description as string}
		>
			<main className={styles.heroContainer}>
				<HomePage {...siteConfig} descriptionLines={lines} />
			</main>
		</Layout>
	);
}

export default Home;