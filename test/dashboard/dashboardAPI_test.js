"use strict";

var conf = require('../../testutil/configureForTest');
var beans = conf.get('beans');

var sinon = require('sinon').sandbox.create();
var expect = require('must');

var moment = require('moment-timezone');

var wikiAPI = beans.get('wikiAPI');
var groupsAndMembersAPI = beans.get('groupsAndMembersAPI');
var activitiesAPI = beans.get('activitiesAPI');
var mailarchiveAPI = beans.get('mailarchiveAPI');

var dashboardAPI = beans.get('dashboardAPI');

describe('Dashboard API', function () {
  var NOT_FOUND = 'notfound';
  var CRASH_ACTIVITY = 'crash activity';
  var member;
  var activity1;
  var activity2;

  beforeEach(function () {
    member = {membername: 'membername'};
    activity1 = {activity: 1};
    activity2 = {activity: 2};
    sinon.stub(groupsAndMembersAPI, 'getUserWithHisGroups', function (nickname, callback) {
      if (nickname === NOT_FOUND) {
        return callback(null, null);
      }
      if (nickname === CRASH_ACTIVITY) {
        return callback(null, CRASH_ACTIVITY);
      }
      callback(null, member);
    });
    sinon.stub(activitiesAPI, 'getUpcomingActivitiesOfMemberAndHisGroups', function (member, callback) {
      if (member === CRASH_ACTIVITY) {
        return callback(new Error());
      }
      callback(null, [activity1, activity2]);
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('collects information from other APIs when no subscribed groups exist', function (done) {
    dashboardAPI.dataForDashboard('nick', function (err, result) {
      expect(result.member).to.equal(member);
      expect(result.activities).to.contain(activity1);
      expect(result.activities).to.contain(activity2);
      expect(result.postsByGroup).to.be.empty();
      expect(result.changesByGroup).to.be.empty();
      expect(result.mailsByGroup).to.be.empty();
      done();
    });
  });

  it('handles the error when no member for nickname found', function (done) {
    dashboardAPI.dataForDashboard(NOT_FOUND, function (err) {
      expect(err).to.exist();
      done();
    });
  });

  it('handles the error when searching activities fails', function (done) {
    dashboardAPI.dataForDashboard(CRASH_ACTIVITY, function (err) {
      expect(err).to.exist();
      done();
    });
  });

  describe('wiki and mailarchive', function () {
    var CRASH_BLOG = 'crash blogs';
    var CRASH_CHANGE = 'crash changes';
    var CRASH_MAILS = 'crash mails';
    var blogs = ['blog1', 'blog2'];
    var changedFiles = ['change1', 'change2'];
    var mail1 = {name: 'mail1', time: moment()};
    var mail2 = {name: 'mail2', time: moment()};
    var veryOldMail = {name: 'mail3', time: moment().subtract('months', 12)};
    var mails = [mail1, mail2];

    beforeEach(function () {
      sinon.stub(wikiAPI, 'getBlogpostsForGroup', function (groupid, callback) {
        if (groupid === CRASH_BLOG) {
          return callback(new Error());
        }
        callback(null, blogs);
      });
      sinon.stub(wikiAPI, 'listChangedFilesinDirectory', function (groupid, callback) {
        if (groupid === CRASH_CHANGE) {
          return callback(new Error());
        }
        callback(null, changedFiles);
      });
      sinon.stub(mailarchiveAPI, 'unthreadedMailsYoungerThan', function (groupid, age, callback) {
        if (groupid === CRASH_MAILS) {
          return callback(new Error());
        }
        callback(null, mails);
      });
    });

    it('collects wiki information', function (done) {
      member.subscribedGroups = [
        {id: 'group'}
      ];
      dashboardAPI.dataForDashboard('nick', function (err, result) {
        expect(result.postsByGroup).to.have.keys(['group']);
        expect(result.postsByGroup.group).to.contain('blog1');
        expect(result.postsByGroup.group).to.contain('blog2');
        expect(result.changesByGroup).to.have.keys(['group']);
        expect(result.changesByGroup.group).to.contain('change1');
        expect(result.changesByGroup.group).to.contain('change2');
        done();
      });
    });

    it('collects mail information, revoking old mails', function (done) {
      member.subscribedGroups = [
        {id: 'group'}
      ];
      dashboardAPI.dataForDashboard('nick', function (err, result) {
        expect(result.mailsByGroup).to.have.keys(['group']);
        expect(result.mailsByGroup.group).to.contain(mail1);
        expect(result.mailsByGroup.group).to.contain(mail2);
        expect(result.mailsByGroup.group).not.to.contain(veryOldMail);
        done();
      });
    });

    it('handles the error when searching blogposts crashes', function (done) {
      member.subscribedGroups = [
        {id: CRASH_BLOG}
      ];
      dashboardAPI.dataForDashboard('nick', function (err) {
        expect(err).to.exist();
        done();
      });
    });

    it('handles the error when searching wiki changes crashes', function (done) {
      member.subscribedGroups = [
        {id: CRASH_CHANGE}
      ];
      dashboardAPI.dataForDashboard('nick', function (err) {
        expect(err).to.exist();
        done();
      });
    });

    it('handles the error when searching wiki changes crashes', function (done) {
      member.subscribedGroups = [
        {id: CRASH_MAILS}
      ];
      dashboardAPI.dataForDashboard('nick', function (err) {
        expect(err).to.exist();
        done();
      });
    });

  });

});