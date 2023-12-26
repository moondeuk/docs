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
			message: 'My name is Deukryong Moon and I normally go by DR Moon. Enthusiastic and self-motivated IT solution architect with over 15 years of experience in manufacturing system development. Possessing a wide range of skills and deep knowledge in software development, including designing, modifying, and testing technical architectures. Proficient in multiple programming languages with a strong background in business domain processes. Known for successfully transforming domain processes into software solutions and consistently delivering projects on time in demanding real-time environments.',
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