#! /usr/bin/python

import sys

from kmlParser import writeKml

if(len(sys.argv) > 2):
    print "Writing from %s to %s" % (sys.argv[1], sys.argv[2])
    writeKml(sys.argv[1], sys.argv[2])
elif(len(sys.argv) > 1):
    writeFile = '%s-copy.kml' % sys.argv[1][:-4]
    print "Writing from %s to %s" % (sys.argv[1], writeFile)
    writeKml(sys.argv[1], writeFile)
else:
    print "Writing Default"
    writeKml("../Parking/Buildings.kml", "./BuildingsCopy.kml")
