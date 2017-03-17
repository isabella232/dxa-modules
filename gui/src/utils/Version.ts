import { IPublication } from "interfaces/Publication";

const VERSION_REGEX = /^(.*)\((\d+(\.\d)*)\)$/i;

export default class Version {

    /**
     * Sort product release versions. Most recent first, oldest last.
     *
     * Logic to sort product release versions
     * 1. If the release version contains a version number between brackets at the end use this eg SDL Knowledge Center 2013 (11.0.4) => use 11.0.4 as version
     * 2. If there is no version info in the product release version sort based on publication version (eg if SDL Web 8 is used on version 3 and SDL Tridion 2013 on version 2
     * we know that SDL Web 8 is newer)
     * 3. If a release version is used on many publications and order could not be defined by publication version the
     * creation date metadata of the publication version is used (most recent data is latest release version)
     * @static
     * @param {string | null} productFamily Product family
     * @param {IPublication[]} publications The list of publications
     * @returns {string | null} A sorted list of product release version titles
     *
     * @memberOf Version
     */
    public static sortProductReleaseVersions(productFamily: string | null, publications: IPublication[]): (string | null)[] {
        const sortByTitle = (a: IPublication, b: IPublication) => {
            const titleA = a.title.toUpperCase();
            const titleB = b.title.toUpperCase();
            if (titleA < titleB) {
                return -1;
            }
            if (titleA > titleB) {
                return 1;
            }
            return 0;
        };

        const sortByCreatedOnDate = (a: IPublication, b: IPublication) => {
            const createdOnA = a.createdOn;
            const createdOnB = b.createdOn;
            // Latest is first
            if (createdOnA < createdOnB) {
                return 1;
            }
            if (createdOnA > createdOnB) {
                return -1;
            }
            return 0;
        };

        const sort = (a: IPublication, b: IPublication) => {
            const versionInTitleA = a.productReleaseVersion && a.productReleaseVersion.match(VERSION_REGEX);
            const versionInTitleB = b.productReleaseVersion && b.productReleaseVersion.match(VERSION_REGEX);

            if (versionInTitleA && versionInTitleB) {
                return this.compareVersion(versionInTitleA[2], versionInTitleB[2]) ? -1 : 1;
            }

            const sameVersion = a.version === b.version;
            const sameCreatedOnDate = a.createdOn === b.createdOn;

            if (a.productReleaseVersion === b.productReleaseVersion) {
                // In this case the publication with the most versions / release combinations is considered to the ordered higher
                const publicationsAReleaseVersions = publications.filter(pub => pub.id === a.id).map(pub => pub.productReleaseVersion);
                const publicationsBReleaseVersions = publications.filter(pub => pub.id === b.id).map(pub => pub.productReleaseVersion);
                return publicationsAReleaseVersions.length > publicationsBReleaseVersions.length ? -1 : 1;
            }

            if (a.id === b.id && !sameVersion) {
                return this.compareVersion(a.version, b.version) ? -1 : 1;
            } else if (!sameCreatedOnDate) {
                return sortByCreatedOnDate(a, b);
            } else {
                return sortByTitle(a, b);
            }
        };

        const pubsForFamily = publications.filter(p => p.productFamily === productFamily);
        const orderedPubs = pubsForFamily.sort(sort);

        // Convert to a product release version (remove version from end if it's in the correct format)
        const releaseVersions = orderedPubs.map(pub => {
            const releaseVersion = pub.productReleaseVersion || null;
            const releaseVersionMatch = releaseVersion && releaseVersion.match(VERSION_REGEX);
            if (releaseVersionMatch) {
                return releaseVersionMatch[1];
            }
            return releaseVersion;
        });
        // Take distinct product release versions
        return releaseVersions.filter((value, index, self) => self.indexOf(value) === index);
    }

    /**
     * Compare two versions
     * @param v1 First version
     * @param v2 Second version
     *
     * @returns {boolean} true = Version 1 is greater, false = Version 2 is greater
     */
    public static compareVersion(v1: string, v2: string): boolean {
        const v1parts = v1.split(".");
        const v2parts = v2.split(".");

        for (let i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return true;
            }

            if (v1parts[i] === v2parts[i]) {
                continue;
            }
            else if (v1parts[i] > v2parts[i]) {
                return true;
            }
            else {
                return false;
            }
        }

        if (v1parts.length !== v2parts.length) {
            return false;
        }

        // Versions are equal
        return true;
    }
}
