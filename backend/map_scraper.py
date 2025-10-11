#!/usr/bin/env python3
"""
Map Scraper for There FunZone URLs
Extracts detailed information from There.com FunZone XML data
"""

import requests
import xml.etree.ElementTree as ET
import sys
import json
import time
from urllib.parse import urlparse, parse_qs

class MapScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; TournamentSystem/1.0)',
            'Accept': 'application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        })
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes

    def scrape_map_data(self, url):
        """
        Scrape map data from a There FunZone URL

        Args:
            url (str): The FunZone URL

        Returns:
            dict: Structured map data or None if failed
        """
        if not url or not url.startswith('https://'):
            return None

        # Check cache first
        cache_key = f"map_data_{url}"
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_timeout:
                return cached_data

        try:
            # Make request with timeout
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            # Get content
            content = response.text

            if not content:
                return None

            # Parse XML
            if '<FunZoneDetail>' in content:
                return self._parse_funzone_xml(content, url)
            else:
                return self._fallback_scrape(content, url)

        except requests.exceptions.RequestException as e:
            return None
        except Exception as e:
            return None

    def _parse_funzone_xml(self, xml_content, url):
        """Parse FunZone XML content"""
        try:
            # Parse XML
            root = ET.fromstring(xml_content)

            # Extract data using XPath
            funzone = root.find('.//FunZone')
            operator = root.find('.//Operator')

            if funzone is None:
                return None

            # Extract all the fields
            map_data = {
                'title': self._get_xml_text(funzone, 'UserTitle'),
                'description': self._get_xml_text(funzone, 'UserDesc'),
                'location': self._get_xml_text(funzone, 'Location'),
                'region': self._get_xml_text(funzone, 'Region'),
                'environment': self._get_xml_text(funzone, 'PhysEnvName'),
                'weather': self._get_xml_text(funzone, 'WeatherName'),
                'image_url': self._get_xml_text(funzone, 'ImageUrl'),
                'map_image_url': self._get_xml_text(funzone, 'MapUrl'),
                'owner': self._get_xml_text(operator, 'Name') if operator is not None else '',
                'owner_id': self._get_xml_text(operator, 'Doid') if operator is not None else '',
                'oid': self._get_xml_text(funzone, 'Oid')
            }

            # Clean up data
            map_data = {k: v.strip() if v else '' for k, v in map_data.items()}

            # Build formatted info string
            formatted_info = self._build_formatted_info(map_data)

            result = {
                'formatted': formatted_info,
                'structured': map_data
            }

            # Cache the result
            cache_key = f"map_data_{url}"
            self.cache[cache_key] = (result, time.time())

            return result

        except ET.ParseError as e:
            return None
        except Exception as e:
            return None

    def _get_xml_text(self, element, tag):
        """Get text content of an XML element"""
        if element is None:
            return ''
        found = element.find(tag)
        return found.text if found is not None else ''

    def _build_formatted_info(self, map_data):
        """Build formatted info string from map data"""
        info_parts = []

        if map_data.get('title'):
            info_parts.append(map_data['title'])

        if map_data.get('location'):
            location_part = map_data['location']
            if map_data.get('region'):
                location_part += f", {map_data['region']}"
            info_parts.append(location_part)

        if map_data.get('environment'):
            info_parts.append(f"Environment: {map_data['environment']}")

        if map_data.get('weather'):
            info_parts.append(f"Weather: {map_data['weather']}")

        if map_data.get('owner'):
            info_parts.append(f"Zone Owner: {map_data['owner']}")

        if map_data.get('description'):
            info_parts.append(f"Description: {map_data['description']}")

        return ' | '.join(info_parts) if info_parts else 'FunZone details available'

    def _fallback_scrape(self, content, url):
        """Fallback scraping for non-XML content"""
        # Try to extract basic info from URL or content
        info_parts = []

        # Extract ID from URL
        if 'id=' in url:
            import re
            id_match = re.search(r'id=(\d+)', url)
            if id_match:
                info_parts.append(f"Zone Map ID: {id_match.group(1)}")

        # Try to extract title from content
        if '<title>' in content and '</title>' in content:
            title_match = re.search(r'<title>(.*?)</title>', content)
            if title_match:
                info_parts.append(f"Title: {title_match.group(1)}")

        result = {
            'formatted': ' | '.join(info_parts) if info_parts else 'Map information available',
            'structured': {}
        }

        return result

def main():
    """Main function for Node.js integration"""
    if len(sys.argv) != 2:
        print("Usage: python map_scraper.py <funzone_url>")
        print("Example: python map_scraper.py 'https://webapps.prod.there.com/funzone/funzone?op=view&id=10714117'")
        sys.exit(1)

    url = sys.argv[1]
    scraper = MapScraper()

    result = scraper.scrape_map_data(url)

    if result:
        # Output JSON format for Node.js consumption
        print(json.dumps(result))
    else:
        # Output fallback result in JSON format
        print(json.dumps({
            'formatted': 'Map information available - View in There for full details',
            'structured': {}
        }))

if __name__ == "__main__":
    main()