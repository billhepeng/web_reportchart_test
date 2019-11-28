# -*- coding: utf-8 -*-
{
    'name': "web reportchart_test",

    'summary': """
        报表测试
        """,

    'description': """
        报表增强 
    """,
    'author': "hepeng",
    'website': "",
    'category': 'Uncategorized',
    'version': '0.1',
    'depends': ['base', 'web','helpdesk','web_reportchart'],
    'data': [
        'views/templates.xml',
        'views/testreport.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'qweb': [
        "static/src/xml/base.xml"
    ],
}
