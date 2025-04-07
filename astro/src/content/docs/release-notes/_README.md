If we change the version for archive, update 'cutOverVersion' in the `_download.liquid` file as well.

Process, or at least one way to do it.

Note, to generate a stub that you can copy/paste to get started on 1, 2 and 3..

> ./generate-release-notes-stub.sh &lt;version>

1. Review the Milestone for the release in GH.
2. Order the GH issues by number sequentially.
3. Document the issue, describing the issue at a high level such that most anyone can understand it.
4. If the GH issue was opened by a community member, provide credit, see examples in existing doc.
5. Identify if any doc updates need to be made as a result of the issue being closed out.
6. Make any doc changes necessary w/ version flags if necessary.
7. If the issue is for a new API, feature, or change to anything, please add a link to that API or relevant section if you say "for more information see..."
8. Close the GH issue.
9. Rinse and repeat until all issues in the milestone are complete.
10. Once all issues are closed in the milestone, close it in GH w/ a date equal to that of the release.
11. If the patch or point release has a db migration, ensure you add the warning for db migration, and add the version to the `upgrade.adoc` file.
12. Do a read through / visual sanity check of release notes for typos, test links, etc.

Release notes should have the following sections. Omit any sections with no entries. Use this order:

### Known Issues
### Security
### Changed
### New
### Fixed
### Enhancements
### Internal
