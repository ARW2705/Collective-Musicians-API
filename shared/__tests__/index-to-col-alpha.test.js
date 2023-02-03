import { indexToColAlpha } from '../index-to-col-alpha'


describe('Shared', () => {

  test('should convert a valid number to an A1 notation string', () => {
    expect(indexToColAlpha(-1).length).toEqual(0)
    expect(indexToColAlpha(0)).toMatch('A')
    expect(indexToColAlpha(4)).toMatch('E')
    expect(indexToColAlpha(47)).toMatch('AV')
    expect(indexToColAlpha(600)).toMatch('WC')
    expect(indexToColAlpha(702)).toMatch('AAA')
  })

})
