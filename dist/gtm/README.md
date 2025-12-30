# GTM Container Export

This folder contains the GTM container export file for ReadyServer tracking implementation.

## Files

- `gtm-container-export.json` - Complete GTM container ready for import

## How to Import

1. **Open GTM**: Go to [tagmanager.google.com](https://tagmanager.google.com)

2. **Select Your Container**: Choose your ReadyServer container (or create a new one)

3. **Go to Admin**: Click the "Admin" tab in the left sidebar

4. **Import Container**: 
   - Click "Import Container" 
   - Select `gtm-container-export.json`
   - Choose "Existing" workspace (or create a new one)
   - Select "Merge" or "Overwrite" based on your needs

5. **Update Placeholders**: After import, update these values:
   - `ACCOUNT_ID` → Your GTM account ID
   - `CONTAINER_ID` → Your GTM container ID  
   - `GA4_MEASUREMENT_ID` → Your GA4 measurement ID (e.g., `G-XXXXXXXXXX`)

6. **Register Custom Dimensions in GA4**: Before going live, register these custom dimensions:

   | Parameter Name | Scope | Description |
   |---------------|-------|-------------|
   | `cta_id` | Event | CTA identifier |
   | `placement` | Event | UI location |
   | `section` | Event | Page section |
   | `destination` | Event | Store destination |
   | `link_type` | Event | Link type |
   | `variant` | Event | A/B test variant |
   | `page_key` | Event | Page identifier |
   | `page_type` | Event | Page category |
   | `faq_id` | Event | FAQ item identifier |
   | `event_id` | Event | Unique event ID |

7. **Preview & Debug**: Use GTM Preview mode to test before publishing

8. **Publish**: Once verified, submit and publish the container version

## Container Contents

### Variables (Data Layer)
- `DL - cta_id`
- `DL - placement`
- `DL - section`
- `DL - destination`
- `DL - url`
- `DL - variant`
- `DL - page_key`
- `DL - page_type`
- `DL - link_type`
- `DL - event_id`
- `DL - faq_id`
- `DL - faq_label`
- `DL - scroll_percentage`
- `DL - time_seconds`
- `DL - section_label`
- `DL - link_domain`
- `DL - form_id`
- `DL - device_type`

### Triggers (Custom Events)
- `page_view`
- `store_outbound_click` (PRIMARY CONVERSION)
- `cta_click`
- `view_section`
- `faq_open`
- `scroll_depth`
- `time_on_page`
- `outbound_link_click`
- `form_submit`

### Tags (GA4 Events)
All events mapped to GA4 with appropriate parameters

## Related Files

- `/src/static/js/analytics.js` - Client-side tracking implementation
- `/docs/gtm-tracking-plan.md` - Full tracking plan documentation

## Support

For questions about implementation, refer to the tracking plan document or contact the development team.

