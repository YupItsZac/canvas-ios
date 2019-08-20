//
// This file is part of Canvas.
// Copyright (C) 2019-present  Instructure, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import XCTest
@testable import Core

class APIAccountNotificationTests: XCTestCase {
    func testGetAccountNotificationsRequest() {
        XCTAssertEqual(GetAccountNotificationsRequest().path, "accounts/self/users/self/account_notifications")
        XCTAssertEqual(GetAccountNotificationsRequest().query, [ .value("per_page", "99") ])
    }

    func testDeleteAccountNotificationRequest() {
        XCTAssertEqual(DeleteAccountNotificationRequest(id: "1").method, .delete)
        XCTAssertEqual(DeleteAccountNotificationRequest(id: "1").path, "accounts/self/users/self/account_notifications/1")
    }
}
