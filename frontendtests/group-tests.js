/*global groups_validator, groupnameAlreadyTaken, prefixAlreadyTaken, contentsOfAlphanumeric, contentsOfPrefixForEMail*/
(function () {
  'use strict';

  describe('Group Form', function () {
    var id = $('#groupform [name=id]');
    var emailPrefix = $('#groupform [name=emailPrefix]');

    var sandbox = sinon.sandbox.create();

    afterEach(function () {
      groups_validator.resetForm();
      sandbox.restore();
    });

    var checkFieldMandatory = function (selector, value) {
      testglobals.mandatoryChecker(groups_validator, selector, value);
    };

    var checkFieldWithPositiveAjaxResponse = function (field) {
      testglobals.checkFieldWithPositiveAjaxResponse(sandbox, groups_validator, field);
    };

    var checkFieldWithNegativeAjaxResponse = function (field, message) {
      testglobals.checkFieldWithNegativeAjaxResponse(sandbox, groups_validator, field, message);
    };

    it('checks that a groupname check response is handled for "true"', function () {
      checkFieldWithPositiveAjaxResponse(id);
    });

    it('checks that a groupname check response is handled for "false"', function () {
      checkFieldWithNegativeAjaxResponse(id, groupnameAlreadyTaken);
    });

    it('checks that a prefix check response is handled for "true"', function () {
      checkFieldWithPositiveAjaxResponse(emailPrefix);
    });

    it('checks that a prefix check response is handled for "false"', function () {
      checkFieldWithNegativeAjaxResponse(emailPrefix, prefixAlreadyTaken);
    });

    it('checks that "id" is mandatory', function () {
      checkFieldMandatory('#groupform [name=id]', 'aa');
    });

    it('checks that "id" shorter than 2 letters is invalid', function () {
      id.val('A');
      expect(groups_validator.element(id)).to.be(false);
    });

    it('checks that "id" longer than 20 letters is invalid', function () {
      id.val('MuchTooMuchText123456');
      expect(groups_validator.element(id)).to.be(false);
    });

    it('checks that "id" checks for forbidden characters', function () {
      id.val('1234%');
      expect(groups_validator.element(id)).to.be(false);
      expect(groups_validator.errorList[0]).to.have.ownProperty('message', contentsOfAlphanumeric);
      id.val('äöü');
      expect(groups_validator.element(id)).to.be(false);
      expect(groups_validator.errorList[0]).to.have.ownProperty('message', contentsOfAlphanumeric);
      id.val('12 34');
      expect(groups_validator.element(id)).to.be(false);
      expect(groups_validator.errorList[0]).to.have.ownProperty('message', contentsOfAlphanumeric);
    });

    it('checks that "id" checks for forbidden characters', function () {
      id.val('123ab_-');
      expect(groups_validator.element(id)).to.be(true);
    });

    it('checks that "emailPrefix" is mandatory', function () {
      checkFieldMandatory('#groupform [name=emailPrefix]', '12345');
    });

    it('checks that a "emailPrefix" shorter than 5 letters is invalid', function () {
      emailPrefix.val('Much');
      expect(groups_validator.element(emailPrefix)).to.be(false);
    });

    it('checks that a "emailPrefix" longer than 15 letters is invalid', function () {
      emailPrefix.val('MuchTooMuchText1');
      expect(groups_validator.element(emailPrefix)).to.be(false);
    });

    it('checks that "emailPrefix" checks for forbidden characters', function () {
      emailPrefix.val('1234%');
      expect(groups_validator.element(emailPrefix)).to.be(false);
      expect(groups_validator.errorList[0]).to.have.ownProperty('message', contentsOfPrefixForEMail);
      emailPrefix.val('äöüÄÖÜ');
      expect(groups_validator.element(emailPrefix)).to.be(false);
      expect(groups_validator.errorList[0]).to.have.ownProperty('message', contentsOfPrefixForEMail);
      emailPrefix.val('12_34');
      expect(groups_validator.element(emailPrefix)).to.be(false);
      expect(groups_validator.errorList[0]).to.have.ownProperty('message', contentsOfPrefixForEMail);
    });

    it('checks that "emailPrefix" checks for forbidden characters', function () {
      emailPrefix.val('123ab -');
      expect(groups_validator.element(emailPrefix)).to.be(true);
    });

    it('checks that "longName" is mandatory', function () {
      checkFieldMandatory('#groupform [name=longName]');
    });

    it('checks that "description" is mandatory', function () {
      checkFieldMandatory('#groupform [name=description]');
    });

    it('checks that "type" is mandatory', function () {
      checkFieldMandatory('#groupform [name=type]', 'Themengruppe');
    });

  });
}());

