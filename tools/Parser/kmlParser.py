#! /usr/bin/python

import sys
import io

class KMLParser:

    def __init__(self):
        self.nodes = []
        self.ignoreWS = True

    def _parse(self):
        kmlTree = KMLTree()
        kmlTree.xmlTag = self.readline();
        kmlTree.head   = self.nextToken()
        return kmlTree

    def parse(self, fileName):
        self.inFile = open(fileName, 'r')
        return self._parse()

    def readline(self):
        return self.inFile.readline()

    def nextChar(self):
        if(self.ignoreWS): return self.nextNonWhitespaceChar()
        return self.inFile.read(1)

    def nextNonWhitespaceChar(self):
        char = ' '
        while(char == ' ' or char == '\t' or char == '\n'):
            char = self.inFile.read(1)
        return char

    def nextToken(self):
        char = self.nextChar()
        if(char == '<'):
            char = self.nextChar()
            if(char == '/'): 
                return self.processEndToken()
            elif(char == '!'):
                return self.processDataToken()
            return self.processBeginToken(char)
        return self.processTextToken(char)
    
    def processEndToken(self):
        char = self.nextChar()
        name = ""
        while(char != '>'):
            name = name + char
            char = self.nextChar()
        self.ignoreWS = True
        return self.nodes.pop()
    
    def processDataToken(self):
        count = 0
        value = '<!'
        self.ignoreWS = False
        while True:
            char = self.nextChar()
            value = value + char
            if(char == '<'): count = count + 1
            if(char == '>'): count = count - 1
            if(count < 0): break
        self.nodes[len(self.nodes)-1].value = value
    
    def processBeginToken(self, firstChar):
        self.ignoreWS = False
        char = self.nextChar()
        name = "" + firstChar
        while(char != '>' and char != ' '):
            name = name + char
            char = self.nextChar()
        node = KMLNode(name)
        if(len(self.nodes) != 0):
            parent = self.nodes[len(self.nodes)-1]
            parent.children.append(node)
        self.nodes.append(node)
        if(char != '>'): self.processOptions()
        while(self.nextToken() != node):
            pass
        return node
    
    def processOptions(self):
        char = self.nextChar()
        key = ""
        value = ""
        self.ignoreWS = False
        while(char != '>'):
            if(char == '='):
                key = value
                value = ""
            elif(char == ' '):
                self.nodes[len(self.nodes)-1].options[key] = value
            elif(char != "'"):
                value = value + char
            char = self.nextChar()
        if(key != ""):
            self.nodes[len(self.nodes)-1].options[key] = value

    def processTextToken(self, char):
        node = self.nodes[len(self.nodes)-1]
        node.value = node.value + char

class KMLTree:
    def __init__(self):
        self.xmlTag = ""
        self.head   = None
    
    def accept(self, aVisitor):
        aVisitor.visitKmlTree(self)

class KMLNode:
    def __init__(self, name):
        self.name = name
        self.value = ""
        self.children = []
        self.options = { }
    
    def addChild(self, node):
        self.children.append(node)
    
    def accept(self, aVisitor):
        return getattr(aVisitor.__class__, 'visit' + self.name)(aVisitor, self)

class KMLWriterVisitor:
    
    def __init__(self, fileName):
        self.outFile = open(fileName, 'w+')
        self.tabs = 0
        self.name = ""
        self.options = {}

    def shiftTab(self):
        self.tabs = self.tabs - 1
    def tab(self):
        self.tabs = self.tabs + 1

    def writeTab(self, aString):
        for i in range(self.tabs):
            self.write("    ")
        self.write(aString)
    
    def write(self, aString):
        self.outFile.write(aString)

    def writeN(self, aString):
        self.write("%s\n" % aString)

    def writeTabOpenTag(self, value):
        self.writeTab("<%s>" % value)
    
    def writeTabOpenTagN(self, value):
        self.writeTab("<%s>\n" % value)
    
    def writeTabCloseTag(self, value):
        self.writeTab("</%s>" % value)

    def writeTabCloseTagN(self, value):
        self.writeTab("</%s>\n" % value)

    def writeOpenTag(self, value):
        self.write("<%s>" % value)
    
    def writeCloseTag(self, value):
        self.write("</%s>" % value)

    def writeCloseTagN(self, value):
        self.write("</%s>\n" % value)
    
    def writeTabOpenTagWithArgsN(self, value, args):
        self.writeTab("<%s " % value)
        for key, value in args.iteritems():
            self.write("%s='%s' " % (key, value))
        self.write(">\n")

    def writeBlockTag(self, aNode):
        self.writeTabOpenTagN(aNode.name)
        self.tab()
        self.visitChildren(aNode)
        self.shiftTab()
        self.writeTabCloseTagN(aNode.name)

    def writeBlockTagWithArgs(self, aNode):
        self.writeTabOpenTagWithArgsN(aNode.name, aNode.options)
        self.tab()
        self.visitChildren(aNode)
        self.shiftTab()
        self.writeTabCloseTagN(aNode.name)

    def writeInlineLeafTag(self, aNode):
        self.writeTabOpenTag(aNode.name)
        self.write(aNode.value)
        self.writeCloseTagN(aNode.name)

    def visitKmlTree(self, aTree):
        self.writeN(aTree.xmlTag)
        aTree.head.accept(self)

    def visitChildren(self, aNode):
        while(len(aNode.children) > 0):
            aNode.children.pop(0).accept(self)
    
    def visitPlacemark(self, placemarkNode):
        self.writeBlockTag(placemarkNode)

    def visitDocument(self, documentNode):
        self.writeBlockTag(documentNode)
    
    def visitname(self, nameNode):
        self.writeInlineLeafTag(nameNode)
        self.name = nameNode.value

    def visitExtendedData(self, extDataNode):
        self.writeBlockTag(extDataNode)

    def visitData(self, dataNode):
        value = dataNode.children[0].value
        self.writeBlockTagWithArgs(dataNode)
        self.options[dataNode.options['name']] = value

    def visitvalue(self, valueNode):
        self.writeInlineLeafTag(valueNode)

    def visitstyleUrl(self, styleUrlNode):
        self.writeInlineLeafTag(styleUrlNode)

    def visitdescription(self, descriptionNode):
        name = self.name.replace(" ", "-") #" ", "")
        self.writeTabOpenTag(descriptionNode.name)
        self.write("<![CDATA[Category: %s" % self.options['Category'])
        #self.write("<br><br><a href='#' onclick=\"toggleInfo('%s')\">Learn More</a>" % name))
        self.write("<br><br><a target='_blank' href='http://ericjohnpc.nmu.edu/Webb/JS/CampusMap/campusMap.html?buildings?%s'>Learn More</a>" % name)
        self.write(']]>');
        self.writeCloseTagN(descriptionNode.name)

    def visitPolygon(self, polygonNode):
        self.writeBlockTag(polygonNode)

    def visitouterBoundaryIs(self, boundaryNode):
        self.writeBlockTag(boundaryNode)

    def visitLinearRing(self, ringNode):
        self.writeBlockTag(ringNode)

    def visittessellate(self, tesNode):
        self.writeInlineLeafTag(tesNode)
        
    def visitcoordinates(self, coordNode):
        self.writeInlineLeafTag(coordNode)

    def visitStyle(self, styleNode):
        self.writeBlockTagWithArgs(styleNode)

    def visitLineStyle(self, lineStyleNode):
        self.writeBlockTag(lineStyleNode)

    def visitcolor(self, colorNode):
        self.writeInlineLeafTag(colorNode)

    def visitwidth(self, widthNode):
        self.writeInlineLeafTag(widthNode)

    def visitPolyStyle(self, polyStyleNode):
        self.writeBlockTag(polyStyleNode)

    def visitfill(self, fillNode):
        self.writeInlineLeafTag(fillNode)

    def visitoutline(self, outlineNode):
        self.writeInlineLeafTag(outlineNode)
    
    def visitkml(self, kmlNode):
        self.writeBlockTagWithArgs(kmlNode)

def writeKml(readFile, writeFile):
    KMLParser().parse(readFile).accept(KMLWriterVisitor(writeFile))
