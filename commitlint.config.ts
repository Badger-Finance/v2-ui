import type { UserConfig } from '@commitlint/types';

const defaultCase = 'lowerCase';
const defaultMaxLength = 100;

const Configuration: UserConfig = {
	/*
	 * Any rules defined here will override rules from @commitlint/config-conventional
	 */
	rules: {
		'type-enum': [
			1,
			'always',
			['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
		],
		'type-case': [1, 'always', defaultCase],
		'type-empty': [1, 'always'],
		'scope-case': [1, 'always', defaultCase],
		'subject-case': [1, 'always', defaultCase],
		'subject-empty': [1, 'always'],
		'subject-full-stop': [1, 'always'],
		'header-max-length': [1, 'always', defaultMaxLength],
		'footer-max-line-length': [1, 'always', defaultMaxLength],
		'body-max-line-length': [1, 'always', defaultMaxLength],
	},
};

module.exports = Configuration;
