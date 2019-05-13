//
// Copyright (C) 2019-present Instructure, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, version 3 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

import Foundation
import Core

extension NativeLoginManager {
    public static func login(as entry: KeychainEntry, brand: Core.Brand = .shared) {
        var body: [String: Any] = [
            "appId": Bundle.main.isTeacherApp ? "teacher" : "student",
            "authToken": entry.accessToken,
            "baseURL": entry.baseURL.absoluteString,
            "branding": [
                "buttonPrimaryBackground": brand.buttonPrimaryBackground.hexString,
                "buttonPrimaryText": brand.buttonPrimaryText.hexString,
                "buttonSecondaryBackground": brand.buttonSecondaryBackground.hexString,
                "buttonSecondaryText": brand.buttonSecondaryText.hexString,
                "fontColorDark": brand.fontColorDark.hexString,
                "headerImageBackground": brand.headerImageBackground.hexString,
                "headerImageUrl": brand.headerImageUrl?.absoluteString ?? "",
                "linkColor": brand.linkColor.hexString,
                "navBackground": brand.navBackground.hexString,
                "navBadgeBackground": brand.navBadgeBackground.hexString,
                "navBadgeText": brand.navBadgeText.hexString,
                "navIconFill": brand.navIconFill.hexString,
                "navIconFillActive": brand.navIconFillActive.hexString,
                "navTextColor": brand.navTextColor.hexString,
                "navTextColorActive": brand.navTextColorActive.hexString,
                "primary": brand.primary.hexString,
            ],
            "countryCode": Locale.current.regionCode ?? "",
            "locale": LocalizationManager.currentLocale ?? "en",
            "user": [
                "avatar_url": entry.userAvatarURL?.absoluteString,
                "id": entry.userID,
                "name": entry.userName,
                "primary_email": entry.userEmail,
            ],
        ]
        if let actAsUserID = entry.actAsUserID {
            body["actAsUserID"] = actAsUserID
        }
        shared().login(body)
    }
}