from time import sleep

url = "http://nginx/"


def test_example(selenium):
    selenium.implicitly_wait(5)
    selenium.get(url)
    h1 = selenium.find_element_by_css_selector('h1')
    assert("NCRMRO" == h1.text)
    post_link = selenium.find_element_by_partial_link_text('Hello World')
    post_link.click()
    h1 = selenium.find_element_by_css_selector('h1')
    assert ("Hello World" in h1.text)



