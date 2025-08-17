import { definePrompt } from 'cz-git'

export default definePrompt({
  alias: { fd: 'docs: fix typos' },
  messages: {
    type: "Select the type of change that you're committing:",
    scope: 'Select the scope of this change:',
    subject: 'Write a commit description:\n',
    body: 'Provide a longer description of the change (optional). Use "|" to break new line:\n',
    confirmCommit: 'Are you sure you want to proceed with the commit above?',
  },
  types: [
    {
      value: 'Feat',
      name: 'Feat:     A new feature',
      emoji: '✨ ',
    },
    {
      value: 'Refactor',
      name: 'Refactor: A code change that neither fixes a bug nor adds a feature',
      emoji: '♻️ ',
    },
    {
      value: 'Fix',
      name: 'Fix:      A bug fix',
      emoji: '🐛 ',
    },
    {
      value: 'Style',
      name: 'Style:    Changes that do not affect the meaning of the code',
      emoji: '💄 ',
    },
    {
      value: 'Chore',
      name: "Chore:    Other changes that don't modify src or test files",
      emoji: '🔨 ',
    },
    {
      value: 'Test',
      name: 'Test:     Adding missing tests or correcting existing tests',
      emoji: '✅ ',
    },
    {
      value: 'Docs',
      name: 'Docs:     Documentation only changes',
      emoji: '📝 ',
    },
    {
      value: 'Ci',
      name: 'Ci:       Changes to our CI configuration files and scripts',
      emoji: '🎡 ',
    },
    {
      value: 'Perf',
      name: 'Perf:     A code change that improves performance',
      emoji: '⚡ ',
    },
    {
      value: 'Revert',
      name: 'Revert:   Reverts a previous commit',
      emoji: '⏪ ',
    },
  ],
  allowEmptyScopes: true,
  breaklineChar: '|',
  useEmoji: true,
  emojiAlign: 'left',
  customScopesAlign: 'bottom',
  upperCaseSubject: true,
  markBreakingChangeMode: false,
  allowBreakingChanges: ['Feat', 'Fix'],
  breaklineNumber: 100,
  skipQuestions: ['breaking', 'footer', 'footerPrefix', 'confirmCommit'],
  customIssuePrefixAlign: 'top',
  emptyIssuePrefixAlias: 'skip',
  customIssuePrefixAlias: 'custom',
  confirmColorize: true,
  maxHeaderLength: Infinity,
  maxSubjectLength: 100,
  minSubjectLength: 0,
})
