describe('homepage', function() {
  beforeEach(function() {
    return browser.ignoreSynchronization = true;
  });
   
  it('should ask for registration', function() {
    browser.get('/');
    
    var availableElement = by.css('.intro');
    browser.wait(function() {
      return browser.isElementPresent(availableElement);
    }, 30000);

    expect(browser.isElementPresent(availableElement)).toBeTruthy();
    
    expect(element(by.css('.intro')).getText()).toEqual("Enter Registration");
  });
});