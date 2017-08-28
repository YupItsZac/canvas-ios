//
//  RegionPinger.swift
//  Airwolf
//
//  Created by Derrick Hathaway on 8/21/17.
//  Copyright © 2017 Instructure. All rights reserved.
//

import Foundation

class RegionPinger: NSObject {
    let region: Region
    
    var pingStartTime = Date()
    var responseTimes: [TimeInterval] = []
    let pinger: SimplePing
    var timeoutTimer: Timer?
    let completed: (Region, TimeInterval) -> Void
    
    init(region: Region, donePinging completed: @escaping (Region, TimeInterval) -> Void) {
        self.region = region
        self.pinger = SimplePing(hostName: region.url.host!)
        self.completed = completed
        
        super.init()
        
        pinger.delegate = self
    }
    
    func record(responseTime: TimeInterval) {
        responseTimes.append(responseTime)
        
        if responseTimes.count >= 5 {
            let sum = responseTimes.reduce(0, +)
            completed(region, sum / Double(responseTimes.count))
        } else {
            pinger.send(with: nil)
        }
    }
    
    func stop() {
        pinger.stop()
        timeoutTimer?.invalidate()
        responseTimes = []
    }
    
    func start() {
        pinger.start()
    }
}

private let timeout = 2.0 // seconds

extension RegionPinger: SimplePingDelegate {
    func simplePing(_ pinger: SimplePing, didStartWithAddress address: Data) {
        // Start the ping immediately
        pinger.send(with: nil)
    }
    
    func simplePing(_ pinger: SimplePing, didSendPacket packet: Data, sequenceNumber: UInt16) {
        print("Pinging \(region.name)")
        pingStartTime = Date()
        timeoutTimer = Timer.scheduledTimer(timeInterval: 2, target: self, selector: #selector(timeoutTriggered(_:)), userInfo: nil, repeats: false)
    }
    
    func simplePing(_ pinger: SimplePing, didFailWithError error: Error) {
        timeoutTimer?.invalidate()
        print("Failed to ping \(region.name)")
        record(responseTime: timeout)
    }
    
    func simplePing(_ pinger: SimplePing, didFailToSendPacket packet: Data, sequenceNumber: UInt16, error: Error) {
        timeoutTimer?.invalidate()
        print("Failed to send packet to \(region.name)")
        record(responseTime: timeout)
    }
    
    func simplePing(_ pinger: SimplePing, didReceivePingResponsePacket packet: Data, sequenceNumber: UInt16) {
        timeoutTimer?.invalidate()
        let responseTime = Date().timeIntervalSince(pingStartTime)
        let ms = Int((responseTime * 1000) + 0.5) // poor man's rounding
        print("Received response from \(region.name) in \(ms)ms")
        record(responseTime: responseTime)
    }
    
    func timeoutTriggered(_ timer: Timer) {
        print("Request to \(region.name) timed out")
        self.record(responseTime: timeout)
        pinger.stop()
        pinger.start()
    }

}
